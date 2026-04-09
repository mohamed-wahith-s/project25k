const { College, Department } = require('./models/College');
const { sequelize } = require('./db');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced for seeding.');

    const colleges = [
      {
        collegeCode: '1',
        name: 'Anna University, CEG Campus',
        location: 'Guindy, Chennai',
        district: 'Chennai',
        branches: [
          { branchName: 'Computer Science & Engineering', branchCode: 'CSE', oc: 199.5, bc: 198.5, bcm: 198.0, mbc: 197.0, sc: 192.5, sca: 190.0, st: 188.0, seats: { OC: 28, BC: 22, BCM: 3, MBC: 18, SC: 14, SCA: 3, ST: 2 } },
          { branchName: 'Electronics & Communication', branchCode: 'ECE', oc: 198.5, bc: 196.0, bcm: 194.5, mbc: 192.0, sc: 185.0, sca: 177.0, st: 170.0, seats: { OC: 37, BC: 32, BCM: 4, MBC: 24, SC: 18, SCA: 3, ST: 2 } }
        ]
      },
      {
        collegeCode: '2',
        name: 'PSG College of Technology',
        location: 'Peelamedu, Coimbatore',
        district: 'Coimbatore',
        branches: [
          { branchName: 'Computer Science & Engineering', branchCode: 'CSE', oc: 199.0, bc: 197.5, bcm: 196.0, mbc: 194.5, sc: 188.0, sca: 180.0, st: 175.0, seats: { OC: 35, BC: 30, BCM: 3, MBC: 20, SC: 15, SCA: 3, ST: 1 } },
          { branchName: 'Mechanical Engineering', branchCode: 'MECH', oc: 195.0, bc: 192.5, bcm: 190.0, mbc: 188.0, sc: 175.0, sca: 165.0, st: 150.0, seats: { OC: 18, BC: 16, BCM: 2, MBC: 12, SC: 9, SCA: 2, ST: 1 } }
        ]
      },
      {
        collegeCode: '3',
        name: 'Government College of Engineering, Salem',
        location: 'Salem',
        district: 'Salem',
        branches: [
          { branchName: 'Civil Engineering', branchCode: 'CIVIL', oc: 188.0, bc: 180.0, bcm: 175.0, mbc: 170.0, sc: 160.0, sca: 155.0, st: 150.0, seats: { OC: 30, BC: 26, BCM: 4, MBC: 20, SC: 15, SCA: 3, ST: 2 } }
        ]
      }
    ];

    for (const data of colleges) {
      const { branches, ...collegeInfo } = data;
      const college = await College.create(collegeInfo);
      if (branches && branches.length > 0) {
        for (const branch of branches) {
          await Department.create({ ...branch, CollegeId: college.id });
        }
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
