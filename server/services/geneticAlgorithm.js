import crypto from 'crypto';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const POPULATION_SIZE = 60;
const GENERATIONS = 300;
const MUTATION_RATE = 0.08;
const ELITISM_COUNT = 6;

function createGene(courses, faculty, rooms) {
  const course = courses[Math.floor(Math.random() * courses.length)];
  const assignedFaculty = faculty.find(f => f.employeeId === course.facultyId) ||
    faculty.filter(f => f.department === course.department)[Math.floor(Math.random() * faculty.filter(f => f.department === course.department).length)] ||
    faculty[Math.floor(Math.random() * faculty.length)];
  
  const suitableRooms = rooms.filter(r => 
    r.type === course.type && r.capacity >= (course.studentsEnrolled || 30)
  );
  const room = suitableRooms.length > 0 
    ? suitableRooms[Math.floor(Math.random() * suitableRooms.length)]
    : rooms[Math.floor(Math.random() * rooms.length)];
  
  const day = DAYS[Math.floor(Math.random() * DAYS.length)];
  const maxSlot = day === 'Saturday' ? 6 : 8;
  const timeSlot = TIME_SLOTS[Math.floor(Math.random() * maxSlot)];

  return {
    courseCode: course.code,
    courseName: course.name,
    facultyName: assignedFaculty.name,
    facultyId: assignedFaculty.employeeId,
    roomNumber: room.number,
    day,
    timeSlot,
    department: course.department,
    type: course.type || 'lecture'
  };
}

function createChromosome(courses, faculty, rooms) {
  const genes = [];
  for (const course of courses) {
    const lecturesNeeded = course.lecturesPerWeek || 3;
    for (let i = 0; i < lecturesNeeded; i++) {
      genes.push(createGene([course], faculty, rooms));
    }
  }
  return genes;
}

function evaluateFitness(chromosome, faculty, rooms, unavailableFaculty = []) {
  let fitness = 1000;
  const conflicts = [];
  
  // Check faculty double-booking (same faculty, same day, same time)
  const facultySlots = {};
  for (const gene of chromosome) {
    const key = `${gene.facultyId}-${gene.day}-${gene.timeSlot}`;
    if (facultySlots[key]) {
      fitness -= 15;
      conflicts.push(`Faculty ${gene.facultyName} double-booked on ${gene.day} slot ${gene.timeSlot}`);
    }
    facultySlots[key] = (facultySlots[key] || 0) + 1;
  }

  // Check room double-booking
  const roomSlots = {};
  for (const gene of chromosome) {
    const key = `${gene.roomNumber}-${gene.day}-${gene.timeSlot}`;
    if (roomSlots[key]) {
      fitness -= 15;
      conflicts.push(`Room ${gene.roomNumber} double-booked on ${gene.day} slot ${gene.timeSlot}`);
    }
    roomSlots[key] = (roomSlots[key] || 0) + 1;
  }

  // Check unavailable faculty
  for (const gene of chromosome) {
    if (unavailableFaculty.includes(gene.facultyId)) {
      fitness -= 50;
      conflicts.push(`Unavailable faculty ${gene.facultyName} still assigned on ${gene.day}`);
    }
  }

  // Reward even distribution of faculty hours
  const facultyHours = {};
  for (const gene of chromosome) {
    facultyHours[gene.facultyId] = (facultyHours[gene.facultyId] || 0) + 1;
  }
  const hours = Object.values(facultyHours);
  if (hours.length > 1) {
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
    const variance = hours.reduce((s, h) => s + Math.pow(h - avg, 2), 0) / hours.length;
    if (variance < 4) fitness += 10;
    if (variance < 2) fitness += 10;
  }

  // Penalize back-to-back same faculty (more than 3 consecutive)
  for (const fid of Object.keys(facultyHours)) {
    for (const day of DAYS) {
      const slots = chromosome
        .filter(g => g.facultyId === fid && g.day === day)
        .map(g => g.timeSlot)
        .sort((a, b) => a - b);
      
      let consecutive = 1;
      for (let i = 1; i < slots.length; i++) {
        if (slots[i] === slots[i-1] + 1) {
          consecutive++;
          if (consecutive > 3) {
            fitness -= 5;
            conflicts.push(`Faculty ${fid} has ${consecutive}+ consecutive slots on ${day}`);
          }
        } else {
          consecutive = 1;
        }
      }
    }
  }

  // Reward spreading classes across the week
  const dayCounts = {};
  for (const gene of chromosome) {
    const key = `${gene.department}-${gene.day}`;
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  }
  const deptDays = Object.values(dayCounts);
  if (deptDays.length > 0) {
    const maxPerDay = Math.max(...deptDays);
    if (maxPerDay <= 6) fitness += 15;
  }

  return { fitness, conflicts: [...new Set(conflicts)] };
}

function tournamentSelection(population, fitnesses, tournamentSize = 4) {
  let bestIdx = Math.floor(Math.random() * population.length);
  for (let i = 1; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    if (fitnesses[idx] > fitnesses[bestIdx]) {
      bestIdx = idx;
    }
  }
  return population[bestIdx];
}

function crossover(parent1, parent2) {
  const child = [];
  for (let i = 0; i < parent1.length; i++) {
    child.push(Math.random() < 0.5 ? { ...parent1[i] } : { ...parent2[i] });
  }
  return child;
}

function mutate(chromosome, courses, faculty, rooms, rate = MUTATION_RATE) {
  return chromosome.map(gene => {
    if (Math.random() < rate) {
      const mutationType = Math.floor(Math.random() * 3);
      const newGene = { ...gene };
      
      switch (mutationType) {
        case 0: {  // Change time slot
          const day = DAYS[Math.floor(Math.random() * DAYS.length)];
          const maxSlot = day === 'Saturday' ? 6 : 8;
          newGene.day = day;
          newGene.timeSlot = TIME_SLOTS[Math.floor(Math.random() * maxSlot)];
          break;
        }
        case 1: {  // Change room
          const suitableRooms = rooms.filter(r => r.type === gene.type);
          const room = suitableRooms.length > 0
            ? suitableRooms[Math.floor(Math.random() * suitableRooms.length)]
            : rooms[Math.floor(Math.random() * rooms.length)];
          newGene.roomNumber = room.number;
          break;
        }
        case 2: {  // Swap day
          const dayIdx = DAYS.indexOf(gene.day);
          const newDayIdx = (dayIdx + 1 + Math.floor(Math.random() * (DAYS.length - 1))) % DAYS.length;
          newGene.day = DAYS[newDayIdx];
          if (newGene.day === 'Saturday' && newGene.timeSlot > 6) {
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

  // Initialize population
  let population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(createChromosome(filteredCourses, availableFaculty, rooms));
  }

  let bestFitness = -Infinity;
  let bestChromosome = null;
  let bestConflicts = [];

  // Evolution loop
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const results = population.map(chromo => 
      evaluateFitness(chromo, availableFaculty, rooms, unavailableFaculty)
    );
    const fitnesses = results.map(r => r.fitness);

    // Track best
    for (let i = 0; i < fitnesses.length; i++) {
      if (fitnesses[i] > bestFitness) {
        bestFitness = fitnesses[i];
        bestChromosome = [...population[i]];
        bestConflicts = results[i].conflicts;
      }
    }

    // Early exit if perfect
    if (bestConflicts.length === 0 && bestFitness >= 1000) break;

    // Create next generation
    const nextGen = [];

    // Elitism: carry forward top performers
    const indexed = fitnesses.map((f, i) => ({ fitness: f, index: i }));
    indexed.sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < ELITISM_COUNT; i++) {
      nextGen.push([...population[indexed[i].index]]);
    }

    // Fill rest with crossover + mutation
    while (nextGen.length < POPULATION_SIZE) {
      const parent1 = tournamentSelection(population, fitnesses);
      const parent2 = tournamentSelection(population, fitnesses);
      let child = crossover(parent1, parent2);
      child = mutate(child, filteredCourses, availableFaculty, rooms);
      nextGen.push(child);
    }

    population = nextGen;
  }

  // Deduplicate conflicts
  const uniqueConflicts = [...new Set(bestConflicts)];

  return {
    entries: bestChromosome || [],
    fitness: bestFitness,
    conflicts: uniqueConflicts,
    conflictCount: uniqueConflicts.length,
    conflictPercentage: bestChromosome 
      ? Math.round((uniqueConflicts.length / bestChromosome.length) * 100) 
      : 0,
    totalSlots: bestChromosome ? bestChromosome.length : 0,
    generatedAt: new Date()
  };
}

export function simulateChange(courses, faculty, rooms, unavailableFacultyIds) {
  return generateTimetable(courses, faculty, rooms, { 
    unavailableFaculty: unavailableFacultyIds 
  });
}
