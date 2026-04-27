export const facultyData = [
  { name: 'Dr. Arjun Mehta', employeeId: 'FAC001', department: 'CSE', email: 'arjun.mehta@nexura.edu', courses: ['CS301', 'CS302'], maxHoursPerWeek: 18 },
  { name: 'Dr. Priya Sharma', employeeId: 'FAC002', department: 'CSE', email: 'priya.sharma@nexura.edu', courses: ['CS303', 'CS304'], maxHoursPerWeek: 20 },
  { name: 'Dr. Vikram Singh', employeeId: 'FAC003', department: 'CSE', email: 'vikram.singh@nexura.edu', courses: ['CS305', 'CS306'], maxHoursPerWeek: 16 },
  { name: 'Dr. Neha Patel', employeeId: 'FAC004', department: 'ECE', email: 'neha.patel@nexura.edu', courses: ['EC301', 'EC302'], maxHoursPerWeek: 18 },
  { name: 'Dr. Rohit Gupta', employeeId: 'FAC005', department: 'ECE', email: 'rohit.gupta@nexura.edu', courses: ['EC303', 'EC304'], maxHoursPerWeek: 20 },
  { name: 'Dr. Sunita Reddy', employeeId: 'FAC006', department: 'ME', email: 'sunita.reddy@nexura.edu', courses: ['ME301', 'ME302'], maxHoursPerWeek: 18 },
  { name: 'Dr. Amit Kumar', employeeId: 'FAC007', department: 'ME', email: 'amit.kumar@nexura.edu', courses: ['ME303'], maxHoursPerWeek: 16 },
  { name: 'Dr. Kavita Joshi', employeeId: 'FAC008', department: 'CSE', email: 'kavita.joshi@nexura.edu', courses: ['CS307'], maxHoursPerWeek: 20 }
];

export const courseData = [
  { code: 'CS301', name: 'Data Structures & Algorithms', department: 'CSE', credits: 4, semester: 3, lecturesPerWeek: 4, type: 'lecture', facultyId: 'FAC001', studentsEnrolled: 60 },
  { code: 'CS302', name: 'Operating Systems', department: 'CSE', credits: 4, semester: 3, lecturesPerWeek: 4, type: 'lecture', facultyId: 'FAC001', studentsEnrolled: 55 },
  { code: 'CS303', name: 'Database Management Systems', department: 'CSE', credits: 3, semester: 3, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC002', studentsEnrolled: 60 },
  { code: 'CS304', name: 'Computer Networks', department: 'CSE', credits: 3, semester: 5, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC002', studentsEnrolled: 50 },
  { code: 'CS305', name: 'Machine Learning', department: 'CSE', credits: 4, semester: 5, lecturesPerWeek: 4, type: 'lecture', facultyId: 'FAC003', studentsEnrolled: 45 },
  { code: 'CS306', name: 'Web Technologies Lab', department: 'CSE', credits: 2, semester: 3, lecturesPerWeek: 2, type: 'lab', facultyId: 'FAC003', studentsEnrolled: 30 },
  { code: 'CS307', name: 'Artificial Intelligence', department: 'CSE', credits: 3, semester: 5, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC008', studentsEnrolled: 50 },
  { code: 'EC301', name: 'Signals & Systems', department: 'ECE', credits: 4, semester: 3, lecturesPerWeek: 4, type: 'lecture', facultyId: 'FAC004', studentsEnrolled: 55 },
  { code: 'EC302', name: 'Digital Electronics', department: 'ECE', credits: 3, semester: 3, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC004', studentsEnrolled: 55 },
  { code: 'EC303', name: 'VLSI Design', department: 'ECE', credits: 3, semester: 5, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC005', studentsEnrolled: 40 },
  { code: 'ME301', name: 'Thermodynamics', department: 'ME', credits: 4, semester: 3, lecturesPerWeek: 4, type: 'lecture', facultyId: 'FAC006', studentsEnrolled: 50 },
  { code: 'ME302', name: 'Fluid Mechanics', department: 'ME', credits: 3, semester: 3, lecturesPerWeek: 3, type: 'lecture', facultyId: 'FAC006', studentsEnrolled: 50 }
];

export const roomData = [
  { number: 'LH-101', building: 'Main Block', capacity: 80, type: 'lecture', facilities: ['Projector', 'AC', 'Whiteboard'] },
  { number: 'LH-102', building: 'Main Block', capacity: 60, type: 'lecture', facilities: ['Projector', 'AC'] },
  { number: 'LH-201', building: 'Science Block', capacity: 70, type: 'lecture', facilities: ['Projector', 'Smart Board'] },
  { number: 'LH-202', building: 'Science Block', capacity: 50, type: 'lecture', facilities: ['Projector'] },
  { number: 'LAB-01', building: 'IT Block', capacity: 35, type: 'lab', facilities: ['Computers', 'Projector', 'AC'] },
  { number: 'LAB-02', building: 'IT Block', capacity: 30, type: 'lab', facilities: ['Computers', 'Projector'] }
];

export const studentData = [
  { name: 'Aarav Patel', rollNo: 'CSE2024001', department: 'CSE', semester: 3, email: 'aarav@nexura.edu', cgpa: 8.7, feesPaid: true, feeAmount: 125000, courses: ['CS301','CS302','CS303','CS306'] },
  { name: 'Diya Sharma', rollNo: 'CSE2024002', department: 'CSE', semester: 3, email: 'diya@nexura.edu', cgpa: 9.2, feesPaid: true, feeAmount: 125000, courses: ['CS301','CS302','CS303','CS306'] },
  { name: 'Vihaan Singh', rollNo: 'CSE2024003', department: 'CSE', semester: 5, email: 'vihaan@nexura.edu', cgpa: 7.8, feesPaid: true, feeAmount: 125000, courses: ['CS304','CS305','CS307'] },
  { name: 'Ananya Gupta', rollNo: 'CSE2024004', department: 'CSE', semester: 5, email: 'ananya@nexura.edu', cgpa: 8.9, feesPaid: false, feeAmount: 0, courses: ['CS304','CS305','CS307'] },
  { name: 'Reyansh Kumar', rollNo: 'CSE2024005', department: 'CSE', semester: 3, email: 'reyansh@nexura.edu', cgpa: 7.5, feesPaid: true, feeAmount: 125000, courses: ['CS301','CS302','CS303'] },
  { name: 'Ishita Reddy', rollNo: 'CSE2024006', department: 'CSE', semester: 5, email: 'ishita@nexura.edu', cgpa: 9.5, feesPaid: true, feeAmount: 125000, courses: ['CS304','CS305','CS307'] },
  { name: 'Aryan Joshi', rollNo: 'CSE2024007', department: 'CSE', semester: 3, email: 'aryan@nexura.edu', cgpa: 6.8, feesPaid: false, feeAmount: 0, courses: ['CS301','CS302','CS303','CS306'] },
  { name: 'Saanvi Mehta', rollNo: 'ECE2024001', department: 'ECE', semester: 3, email: 'saanvi@nexura.edu', cgpa: 8.3, feesPaid: true, feeAmount: 115000, courses: ['EC301','EC302'] },
  { name: 'Kabir Desai', rollNo: 'ECE2024002', department: 'ECE', semester: 3, email: 'kabir@nexura.edu', cgpa: 7.6, feesPaid: true, feeAmount: 115000, courses: ['EC301','EC302'] },
  { name: 'Myra Iyer', rollNo: 'ECE2024003', department: 'ECE', semester: 5, email: 'myra@nexura.edu', cgpa: 9.1, feesPaid: true, feeAmount: 115000, courses: ['EC303'] },
  { name: 'Aditya Nair', rollNo: 'ECE2024004', department: 'ECE', semester: 3, email: 'aditya@nexura.edu', cgpa: 7.2, feesPaid: false, feeAmount: 0, courses: ['EC301','EC302'] },
  { name: 'Zara Khan', rollNo: 'ECE2024005', department: 'ECE', semester: 5, email: 'zara@nexura.edu', cgpa: 8.8, feesPaid: true, feeAmount: 115000, courses: ['EC303'] },
  { name: 'Vivaan Rao', rollNo: 'ME2024001', department: 'ME', semester: 3, email: 'vivaan@nexura.edu', cgpa: 7.9, feesPaid: true, feeAmount: 110000, courses: ['ME301','ME302'] },
  { name: 'Kiara Bhat', rollNo: 'ME2024002', department: 'ME', semester: 3, email: 'kiara@nexura.edu', cgpa: 8.4, feesPaid: true, feeAmount: 110000, courses: ['ME301','ME302'] },
  { name: 'Dhruv Pillai', rollNo: 'ME2024003', department: 'ME', semester: 3, email: 'dhruv@nexura.edu', cgpa: 6.5, feesPaid: false, feeAmount: 0, courses: ['ME301','ME302'] },
  { name: 'Tara Menon', rollNo: 'ME2024004', department: 'ME', semester: 3, email: 'tara@nexura.edu', cgpa: 9.0, feesPaid: true, feeAmount: 110000, courses: ['ME301','ME302'] },
  { name: 'Rohan Verma', rollNo: 'CSE2024008', department: 'CSE', semester: 3, email: 'rohan@nexura.edu', cgpa: 8.1, feesPaid: true, feeAmount: 125000, courses: ['CS301','CS302','CS303'] },
  { name: 'Nisha Agarwal', rollNo: 'CSE2024009', department: 'CSE', semester: 5, email: 'nisha@nexura.edu', cgpa: 8.6, feesPaid: true, feeAmount: 125000, courses: ['CS304','CS305','CS307'] },
  { name: 'Pranav Shetty', rollNo: 'ECE2024006', department: 'ECE', semester: 3, email: 'pranav@nexura.edu', cgpa: 7.4, feesPaid: true, feeAmount: 115000, courses: ['EC301','EC302'] },
  { name: 'Aisha Malik', rollNo: 'ME2024005', department: 'ME', semester: 3, email: 'aisha@nexura.edu', cgpa: 8.0, feesPaid: true, feeAmount: 110000, courses: ['ME301','ME302'] }
];
