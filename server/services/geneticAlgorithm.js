import crypto from 'crypto';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const POPULATION_SIZE = 60;
const GENERATIONS = 300;
const MUTATION_RATE = 0.08;
const ELITISM_COUNT = 6;

function createChromosome(staticGenes) {
  const genes = [];
  for (let i = 0; i < staticGenes.length; i++) {
    const sg = staticGenes[i];
    const roomIdx = sg.suitableRoomIdxs[Math.floor(Math.random() * sg.suitableRoomIdxs.length)];
    const dayIdx = Math.floor(Math.random() * DAYS.length);
    const maxSlot = dayIdx === 5 ? 6 : 8; // Saturday is index 5
    const timeSlot = Math.floor(Math.random() * maxSlot) + 1;
    genes.push({ roomIdx, dayIdx, timeSlot });
  }
  return genes;
}

function evaluateFitness(chromosome, staticGenes, availableFaculty, rooms, unavailableFacultySet, facultyCount, roomCount, deptCount) {
  let fitness = 1000;
  const conflicts = [];

  // Flat arrays for fast tracking
  const facultySlots = new Uint8Array(facultyCount * 48);
  const roomSlots = new Uint8Array(roomCount * 48);
  const facultyDayMasks = new Uint8Array(facultyCount * 6);
  const facultyHours = new Uint8Array(facultyCount);
  const deptDayCounts = new Uint8Array(deptCount * 6);

  for (let i = 0; i < chromosome.length; i++) {
    const gene = chromosome[i];
    const sg = staticGenes[i];

    const fIdx = sg.facultyIdx;
    const rIdx = gene.roomIdx;
    const dayIdx = gene.dayIdx;
    const timeSlot = gene.timeSlot;

    const sIdx = dayIdx * 8 + (timeSlot - 1);

    // Check faculty double-booking
    const fsKey = fIdx * 48 + sIdx;
    if (facultySlots[fsKey]) {
      fitness -= 15;
      conflicts.push(`Faculty ${sg.facultyName} double-booked on ${DAYS[dayIdx]} slot ${timeSlot}`);
    }
    facultySlots[fsKey] = 1;

    // Check room double-booking
    const rsKey = rIdx * 48 + sIdx;
    if (roomSlots[rsKey]) {
      fitness -= 15;
      conflicts.push(`Room ${rooms[rIdx].number} double-booked on ${DAYS[dayIdx]} slot ${timeSlot}`);
    }
    roomSlots[rsKey] = 1;

    // Check unavailable faculty
    if (unavailableFacultySet.has(sg.facultyId)) {
      fitness -= 50;
      conflicts.push(`Unavailable faculty ${sg.facultyName} still assigned on ${DAYS[dayIdx]}`);
    }

    // Accumulate faculty hours
    facultyHours[fIdx]++;

    // Accumulate faculty day slots for consecutive checks
    facultyDayMasks[fIdx * 6 + dayIdx] |= (1 << (timeSlot - 1));

    // Accumulate day counts for spreading classes
    deptDayCounts[sg.deptIdx * 6 + dayIdx]++;
  }

  // Reward even distribution of faculty hours
  let sum = 0;
  let count = 0;
  for (let i = 0; i < facultyCount; i++) {
    const h = facultyHours[i];
    if (h > 0) {
      sum += h;
      count++;
    }
  }
  if (count > 1) {
    const avg = sum / count;
    let varianceSum = 0;
    for (let i = 0; i < facultyCount; i++) {
      const h = facultyHours[i];
      if (h > 0) {
        varianceSum += Math.pow(h - avg, 2);
      }
    }
    const variance = varianceSum / count;
    if (variance < 4) fitness += 10;
    if (variance < 2) fitness += 10;
  }

  // Penalize back-to-back same faculty (> 3 consecutive)
  for (let fIdx = 0; fIdx < facultyCount; fIdx++) {
    for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
      const mask = facultyDayMasks[fIdx * 6 + dayIdx];
      // Quick bitwise check for 4 consecutive set bits
      let temp = mask & (mask >> 1);
      temp = temp & (temp >> 2);
      if (temp !== 0) {
        fitness -= 5;
        // Count actual max consecutive bits
        let maxLen = 0;
        let curLen = 0;
        for (let b = 0; b < 8; b++) {
          if ((mask & (1 << b)) !== 0) {
            curLen++;
            if (curLen > maxLen) maxLen = curLen;
          } else {
            curLen = 0;
          }
        }
        conflicts.push(`Faculty ${availableFaculty[fIdx].employeeId} has ${maxLen}+ consecutive slots on ${DAYS[dayIdx]}`);
      }
    }
  }

  // Reward spreading classes across the week
  let maxPerDay = 0;
  let hasClasses = false;
  for (let i = 0; i < deptDayCounts.length; i++) {
    const c = deptDayCounts[i];
    if (c > 0) hasClasses = true;
    if (c > maxPerDay) maxPerDay = c;
  }
  if (hasClasses && maxPerDay <= 6) fitness += 15;

  return { fitness, conflicts: [...new Set(conflicts)] };
}

function tournamentSelection(population, tournamentSize = 4) {
  let bestIdx = Math.floor(Math.random() * population.length);
  for (let i = 1; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    if (population[idx].fitness > population[bestIdx].fitness) {
      bestIdx = idx;
    }
  }
  return population[bestIdx];
}

function crossover(parent1, parent2) {
  const child = [];
  for (let i = 0; i < parent1.length; i++) {
    child.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
  }
  return child;
}

function mutate(chromosome, staticGenes, rooms, roomsByType, rate = MUTATION_RATE) {
  return chromosome.map((gene, idx) => {
    if (Math.random() < rate) {
      const mutationType = Math.floor(Math.random() * 3);
      const newGene = { ...gene };
      
      switch (mutationType) {
        case 0: {  // Change time slot
          const dayIdx = Math.floor(Math.random() * DAYS.length);
          const maxSlot = dayIdx === 5 ? 6 : 8;
          newGene.dayIdx = dayIdx;
          newGene.timeSlot = Math.floor(Math.random() * maxSlot) + 1;
          break;
        }
        case 1: {  // Change room
          const sg = staticGenes[idx];
          // Pick random suitable room index
          newGene.roomIdx = sg.suitableRoomIdxs[Math.floor(Math.random() * sg.suitableRoomIdxs.length)];
          break;
        }
        case 2: {  // Swap day
          const newDayIdx = (gene.dayIdx + 1 + Math.floor(Math.random() * (DAYS.length - 1))) % DAYS.length;
          newGene.dayIdx = newDayIdx;
          if (newDayIdx === 5 && newGene.timeSlot > 6) {
            newGene.timeSlot = Math.floor(Math.random() * 6) + 1;
          }
          break;
        }
      }
      return newGene;
    }
    return gene;
  });
}

export function generateTimetable(courses, faculty, rooms, options = {}) {
  const { unavailableFaculty = [], department, semester } = options;
  
  // Filter data
  let filteredCourses = courses;
  if (department) {
    filteredCourses = courses.filter(c => c.department === department);
  }
  if (semester) {
    filteredCourses = filteredCourses.filter(c => c.semester === semester);
  }
  if (filteredCourses.length === 0) filteredCourses = courses;

  const availableFaculty = faculty.filter(f => !unavailableFaculty.includes(f.employeeId));
  if (availableFaculty.length === 0) {
    return {
      entries: [],
      fitness: 0,
      conflicts: ['No available faculty!'],
      conflictCount: 1,
      generatedAt: new Date()
    };
  }

  const unavailableFacultySet = new Set(unavailableFaculty);
  const facultyCount = availableFaculty.length;
  const roomCount = rooms.length;

  // Pre-index faculty
  const facultyIdxMap = new Map();
  const facultyByDept = new Map();
  for (let i = 0; i < availableFaculty.length; i++) {
    const f = availableFaculty[i];
    facultyIdxMap.set(f.employeeId, i);
    if (!facultyByDept.has(f.department)) {
      facultyByDept.set(f.department, []);
    }
    facultyByDept.get(f.department).push(f);
  }

  // Pre-index rooms
  const roomIdxMap = new Map();
  for (let i = 0; i < rooms.length; i++) {
    roomIdxMap.set(rooms[i].number, i);
  }

  // Pre-index departments
  const deptList = [...new Set(filteredCourses.map(c => c.department))];
  const deptIdxMap = new Map();
  for (let i = 0; i < deptList.length; i++) {
    deptIdxMap.set(deptList[i], i);
  }
  const deptCount = deptList.length;

  // Pre-compute rooms by type
  const roomsByType = new Map();
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    if (!roomsByType.has(r.type)) {
      roomsByType.set(r.type, []);
    }
    roomsByType.get(r.type).push(r);
  }

  // Build staticGenes list
  const staticGenes = [];
  for (let i = 0; i < filteredCourses.length; i++) {
    const course = filteredCourses[i];
    
    // Find assigned faculty
    let assignedFaculty = availableFaculty.find(f => f.employeeId === course.facultyId);
    if (!assignedFaculty) {
      const deptFaculty = facultyByDept.get(course.department);
      if (deptFaculty && deptFaculty.length > 0) {
        assignedFaculty = deptFaculty[Math.floor(Math.random() * deptFaculty.length)];
      } else {
        assignedFaculty = availableFaculty[Math.floor(Math.random() * availableFaculty.length)];
      }
    }

    const facultyIdx = facultyIdxMap.get(assignedFaculty.employeeId);
    const deptIdx = deptIdxMap.get(course.department);

    // Pre-compute suitable rooms for this course
    const suitable = rooms.filter(r => 
      r.type === course.type && r.capacity >= (course.studentsEnrolled || 30)
    );
    const suitableRoomIdxs = suitable.length > 0 
      ? suitable.map(r => roomIdxMap.get(r.number))
      : rooms.map((r, idx) => idx);

    const lecturesNeeded = course.lecturesPerWeek || 3;
    for (let l = 0; l < lecturesNeeded; l++) {
      staticGenes.push({
        courseCode: course.code,
        courseName: course.name,
        facultyName: assignedFaculty.name,
        facultyId: assignedFaculty.employeeId,
        department: course.department,
        type: course.type || 'lecture',
        facultyIdx,
        deptIdx,
        suitableRoomIdxs
      });
    }
  }

  // Initialize population
  let population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const genes = createChromosome(staticGenes);
    const { fitness, conflicts } = evaluateFitness(
      genes, staticGenes, availableFaculty, rooms, unavailableFacultySet, facultyCount, roomCount, deptCount
    );
    population.push({ genes, fitness, conflicts });
  }

  let bestFitness = -Infinity;
  let bestChromosome = null;
  let bestConflicts = [];

  // Evolution loop
  for (let gen = 0; gen < GENERATIONS; gen++) {
    // Sort descending by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    // Track best
    if (population[0].fitness > bestFitness) {
      bestFitness = population[0].fitness;
      bestChromosome = population[0].genes;
      bestConflicts = population[0].conflicts;
    }

    // Early exit if perfect
    if (bestConflicts.length === 0 && bestFitness >= 1000) break;

    // Create next generation
    const nextGen = [];

    // Elitism: carry forward top performers
    for (let i = 0; i < ELITISM_COUNT; i++) {
      nextGen.push(population[i]);
    }

    // Fill rest with crossover + mutation
    while (nextGen.length < POPULATION_SIZE) {
      const parent1 = tournamentSelection(population);
      const parent2 = tournamentSelection(population);
      const childGenes = crossover(parent1.genes, parent2.genes);
      const mutatedGenes = mutate(childGenes, staticGenes, rooms, roomsByType);
      
      const { fitness, conflicts } = evaluateFitness(
        mutatedGenes, staticGenes, availableFaculty, rooms, unavailableFacultySet, facultyCount, roomCount, deptCount
      );
      nextGen.push({ genes: mutatedGenes, fitness, conflicts });
    }

    population = nextGen;
  }

  // Deduplicate conflicts
  const uniqueConflicts = [...new Set(bestConflicts)];

  // Map back to original structure
  const finalEntries = (bestChromosome || []).map((gene, idx) => {
    const sg = staticGenes[idx];
    return {
      courseCode: sg.courseCode,
      courseName: sg.courseName,
      facultyName: sg.facultyName,
      facultyId: sg.facultyId,
      roomNumber: rooms[gene.roomIdx].number,
      day: DAYS[gene.dayIdx],
      timeSlot: gene.timeSlot,
      department: sg.department,
      type: sg.type
    };
  });

  return {
    entries: finalEntries,
    fitness: bestFitness,
    conflicts: uniqueConflicts,
    conflictCount: uniqueConflicts.length,
    conflictPercentage: finalEntries.length > 0
      ? Math.round((uniqueConflicts.length / finalEntries.length) * 100)
      : 0,
    totalSlots: finalEntries.length,
    generatedAt: new Date()
  };
}

export function simulateChange(courses, faculty, rooms, unavailableFacultyIds) {
  return generateTimetable(courses, faculty, rooms, { 
    unavailableFaculty: unavailableFacultyIds 
  });
}
