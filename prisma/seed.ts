import { PrismaClient, Role, Difficulty, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EdTech database...');

  const adminHash = bcrypt.hashSync('admin123', 10);
  const studentHash = bcrypt.hashSync('student123', 10);

  const admin1 = await prisma.user.upsert({ where: { email: 'ashish@admin.com' }, update: {}, create: { name: 'Ashish Shaw', email: 'ashish@admin.com', passwordHash: adminHash, role: Role.Admin } });
  await prisma.user.upsert({ where: { email: 'dilip@admin.com' }, update: {}, create: { name: 'Dilip Shah', email: 'dilip@admin.com', passwordHash: adminHash, role: Role.Admin } });
  await prisma.user.upsert({ where: { email: 'student1@edtech.com' }, update: {}, create: { name: 'Amit Patel', email: 'student1@edtech.com', passwordHash: studentHash, role: Role.Student, grade: '10', board: 'CBSE' } });
  await prisma.user.upsert({ where: { email: 'student2@edtech.com' }, update: {}, create: { name: 'Priya Sharma', email: 'student2@edtech.com', passwordHash: studentHash, role: Role.Student, grade: '9', board: 'CBSE' } });

  console.log('Admins and demo students seeded.');

  const Q = (grade: string, subject: string, chapter: string, difficulty: Difficulty, content: string, options: string[], correctAnswer: string, tags: string[]) => ({
    board: 'CBSE', grade, subject, topic: chapter, chapter, difficulty, type: QuestionType.MCQ, content, options, correctAnswer, tags,
  });

  const questions = [
    // === STD 7 MATHS (20 questions) ===
    Q('7','Maths','Integers',Difficulty.Easy,'What is (-5) × (-8)?',['40','-40','13','-13'],'40',['integers']),
    Q('7','Maths','Integers',Difficulty.Easy,'(-12) ÷ (-4) = ?',['-3','3','-8','8'],'3',['integers']),
    Q('7','Maths','Integers',Difficulty.Medium,'Which is the smallest negative integer?',['0','-1','Does not exist','-100'],'Does not exist',['integers']),
    Q('7','Maths','Integers',Difficulty.Hard,'(-1) × (-1) × (-1) = ?',['1','-1','0','undefined'],'-1',['integers']),
    Q('7','Maths','Fractions and Decimals',Difficulty.Easy,'3/4 is equivalent to:',['6/8','9/16','4/3','5/6'],'6/8',['fractions']),
    Q('7','Maths','Fractions and Decimals',Difficulty.Medium,'2.5 × 4 = ?',['8','10','12','6.5'],'10',['decimals']),
    Q('7','Maths','Fractions and Decimals',Difficulty.Medium,'0.1 × 0.1 = ?',['0.1','0.01','0.001','1'],'0.01',['decimals']),
    Q('7','Maths','Simple Equations',Difficulty.Easy,'Solve: x + 5 = 12',['5','7','17','6'],'7',['equations']),
    Q('7','Maths','Simple Equations',Difficulty.Medium,'Solve: 2x - 3 = 7',['2','5','3','10'],'5',['equations']),
    Q('7','Maths','Lines and Angles',Difficulty.Easy,'Sum of angles on a straight line is:',['90°','180°','270°','360°'],'180°',['geometry']),
    Q('7','Maths','Lines and Angles',Difficulty.Medium,'Vertically opposite angles are:',['Supplementary','Complementary','Equal','Adjacent'],'Equal',['geometry']),
    Q('7','Maths','The Triangle and its Properties',Difficulty.Easy,'Sum of all angles in a triangle is:',['90°','180°','270°','360°'],'180°',['triangles']),
    Q('7','Maths','The Triangle and its Properties',Difficulty.Medium,'An equilateral triangle has how many equal sides?',['1','2','3','0'],'3',['triangles']),
    Q('7','Maths','Perimeter and Area',Difficulty.Easy,'Area of a rectangle with length 6 and width 4 is:',['10','20','24','48'],'24',['mensuration']),
    Q('7','Maths','Perimeter and Area',Difficulty.Medium,'Perimeter of a square with side 5 cm is:',['10','20','25','100'],'20',['mensuration']),
    Q('7','Maths','Algebraic Expressions',Difficulty.Easy,'What is the coefficient of x in 5x + 3?',['3','5','8','x'],'5',['algebra']),
    Q('7','Maths','Algebraic Expressions',Difficulty.Medium,'Simplify: 3x + 2x',['5','5x','6x','x5'],'5x',['algebra']),
    Q('7','Maths','Ratio and Proportion',Difficulty.Easy,'Ratio of 15 to 20 in simplest form:',['15:20','3:4','4:3','1:2'],'3:4',['ratio']),
    Q('7','Maths','Ratio and Proportion',Difficulty.Medium,'If 3:4 = x:12, then x is:',['6','9','8','4'],'9',['proportion']),
    Q('7','Maths','Data Handling',Difficulty.Easy,'The most frequently occurring value in data is called:',['Mean','Median','Mode','Range'],'Mode',['statistics']),
    // === STD 7 SCIENCE (20 questions) ===
    Q('7','Science','Nutrition in Plants',Difficulty.Easy,'Which part of the plant makes food by photosynthesis?',['Roots','Stem','Leaves','Flowers'],'Leaves',['biology']),
    Q('7','Science','Nutrition in Plants',Difficulty.Medium,'Chlorophyll is present in:',['Mitochondria','Chloroplast','Nucleus','Vacuole'],'Chloroplast',['biology']),
    Q('7','Science','Nutrition in Animals',Difficulty.Easy,'Amoeba digests food in its:',['Stomach','Food vacuole','Intestine','Mouth'],'Food vacuole',['biology']),
    Q('7','Science','Heat',Difficulty.Easy,'Normal human body temperature is:',['37°C','98°C','100°C','32°C'],'37°C',['physics']),
    Q('7','Science','Heat',Difficulty.Medium,'Heat transfer through direct contact is called:',['Convection','Radiation','Conduction','Evaporation'],'Conduction',['physics']),
    Q('7','Science','Acids Bases and Salts',Difficulty.Easy,'Citric acid is found in:',['Milk','Lemons','Vinegar','Baking soda'],'Lemons',['chemistry']),
    Q('7','Science','Acids Bases and Salts',Difficulty.Medium,'Litmus turns red in:',['Acid','Base','Salt','Water'],'Acid',['chemistry']),
    Q('7','Science','Physical and Chemical Changes',Difficulty.Easy,'Rusting of iron is a:',['Physical change','Chemical change','Reversible change','Nuclear change'],'Chemical change',['chemistry']),
    Q('7','Science','Physical and Chemical Changes',Difficulty.Medium,'Melting of ice is a:',['Chemical change','Irreversible change','Physical change','Nuclear change'],'Physical change',['chemistry']),
    Q('7','Science','Weather Climate and Adaptations',Difficulty.Easy,'Humidity refers to the amount of ___ in air.',['Dust','Water vapour','Oxygen','Carbon dioxide'],'Water vapour',['environment']),
    Q('7','Science','Soil',Difficulty.Easy,'The topmost layer of the earth is called:',['Mantle','Bedrock','Soil','Crust'],'Soil',['environment']),
    Q('7','Science','Respiration in Organisms',Difficulty.Medium,'Tiny pores on leaves for gaseous exchange are called:',['Stomata','Lenticels','Xylem','Phloem'],'Stomata',['biology']),
    Q('7','Science','Respiration in Organisms',Difficulty.Hard,'Anaerobic respiration produces:',['CO2 and water','Ethanol and CO2','Only CO2','Only water'],'Ethanol and CO2',['biology']),
    Q('7','Science','Transportation in Animals and Plants',Difficulty.Medium,'The fluid that carries nutrients in plants through phloem is called:',['Sap','Blood','Lymph','Xylem'],'Sap',['biology']),
    Q('7','Science','Reproduction in Plants',Difficulty.Easy,'Reproducing through seeds is a:',['Vegetative method','Sexual method','Budding method','Spore method'],'Sexual method',['biology']),
    Q('7','Science','Motion and Time',Difficulty.Easy,'The SI unit of time is:',['Minute','Second','Hour','Millisecond'],'Second',['physics']),
    Q('7','Science','Motion and Time',Difficulty.Medium,'Speed = Distance ÷ ?',['Time','Mass','Force','Acceleration'],'Time',['physics']),
    Q('7','Science','Electric Current and its Effects',Difficulty.Easy,'A fuse wire is made of material with:',['High melting point','Low melting point','High resistance','Low resistance'],'Low melting point',['physics']),
    Q('7','Science','Light',Difficulty.Easy,'A plane mirror produces a:',['Real image','Virtual image','Inverted image','Magnified image'],'Virtual image',['physics']),
    Q('7','Science','Forests Our Lifeline',Difficulty.Easy,'Forests help in maintaining the:',['Sea level','Water cycle','Oil reserves','Soil hardness'],'Water cycle',['environment']),

    // === STD 8 MATHS (20 questions) ===
    Q('8','Maths','Rational Numbers',Difficulty.Easy,'0 is:',['Natural number','Rational number','Irrational number','Complex number'],'Rational number',['numbers']),
    Q('8','Maths','Rational Numbers',Difficulty.Medium,'Which is between 1/4 and 1/2?',['1/3','3/4','2/3','5/6'],'1/3',['numbers']),
    Q('8','Maths','Linear Equations in One Variable',Difficulty.Easy,'Solve: x + 7 = 15',['6','7','8','9'],'8',['algebra']),
    Q('8','Maths','Linear Equations in One Variable',Difficulty.Medium,'Solve: 3x - 6 = 9',['3','4','5','6'],'5',['algebra']),
    Q('8','Maths','Understanding Quadrilaterals',Difficulty.Easy,'A quadrilateral has how many sides?',['3','4','5','6'],'4',['geometry']),
    Q('8','Maths','Understanding Quadrilaterals',Difficulty.Medium,'Sum of all interior angles of a quadrilateral is:',['180°','270°','360°','540°'],'360°',['geometry']),
    Q('8','Maths','Data Handling',Difficulty.Easy,'A pie chart represents data using:',['Bars','Lines','Circles','Dots'],'Circles',['statistics']),
    Q('8','Maths','Squares and Square Roots',Difficulty.Easy,'√144 = ?',['12','14','16','18'],'12',['squares']),
    Q('8','Maths','Squares and Square Roots',Difficulty.Medium,'Which number is a perfect square?',['15','20','25','30'],'25',['squares']),
    Q('8','Maths','Cubes and Cube Roots',Difficulty.Medium,'∛512 = ?',['6','7','8','9'],'8',['cubes']),
    Q('8','Maths','Cubes and Cube Roots',Difficulty.Hard,'∛(-27) = ?',['3','-3','27','-27'],'-3',['cubes']),
    Q('8','Maths','Comparing Quantities',Difficulty.Easy,'20% of 200 = ?',['20','30','40','50'],'40',['percentage']),
    Q('8','Maths','Comparing Quantities',Difficulty.Medium,'Simple interest on ₹1000 at 5% for 2 years:',['₹50','₹100','₹150','₹200'],'₹100',['interest']),
    Q('8','Maths','Algebraic Expressions and Identities',Difficulty.Easy,'(a+b)² = ?',['a²+b²','a²+2ab+b²','a²-2ab+b²','2a+2b'],'a²+2ab+b²',['algebra']),
    Q('8','Maths','Mensuration',Difficulty.Easy,'Area of a circle with radius 7 cm (π=22/7):',['44','154','22','308'],'154',['mensuration']),
    Q('8','Maths','Mensuration',Difficulty.Medium,'Volume of a cube with side 3 cm:',['9','18','27','81'],'27',['mensuration']),
    Q('8','Maths','Exponents and Powers',Difficulty.Medium,'Value of 2⁻³:',['8','-8','1/8','-1/8'],'1/8',['exponents']),
    Q('8','Maths','Direct and Inverse Proportions',Difficulty.Easy,'If 5 workers finish in 10 days, 10 workers finish in:',['20 days','5 days','15 days','2 days'],'5 days',['proportion']),
    Q('8','Maths','Factorisation',Difficulty.Medium,'Factorise: x² - 9',['(x-3)(x-3)','(x+3)(x-3)','(x+9)(x-1)','(x-9)(x+1)'],'(x+3)(x-3)',['algebra']),
    Q('8','Maths','Introduction to Graphs',Difficulty.Easy,'The x-axis is also called:',['Ordinate','Abscissa','Origin','Y-axis'],'Abscissa',['graphs']),
    // === STD 8 SCIENCE (20 questions) ===
    Q('8','Science','Crop Production and Management',Difficulty.Easy,'Which gas is essential for photosynthesis?',['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'],'Carbon dioxide',['biology']),
    Q('8','Science','Microorganisms Friend and Foe',Difficulty.Easy,'Yeast is used to produce:',['Sugar','Alcohol','Salt','Vinegar'],'Alcohol',['biology']),
    Q('8','Science','Microorganisms Friend and Foe',Difficulty.Medium,'Which disease is caused by bacteria?',['Malaria','Tuberculosis','Dengue','Influenza'],'Tuberculosis',['biology']),
    Q('8','Science','Synthetic Fibres and Plastics',Difficulty.Easy,'Nylon is a:',['Natural fibre','Synthetic fibre','Protein fibre','Animal fibre'],'Synthetic fibre',['chemistry']),
    Q('8','Science','Materials Metals and Non-Metals',Difficulty.Easy,'Which is the best conductor of electricity?',['Wood','Rubber','Copper','Plastic'],'Copper',['chemistry']),
    Q('8','Science','Materials Metals and Non-Metals',Difficulty.Medium,'Non-metals are generally:',['Lustrous','Malleable','Ductile','Brittle'],'Brittle',['chemistry']),
    Q('8','Science','Coal and Petroleum',Difficulty.Easy,'Fossil fuels are:',['Renewable','Non-renewable','Inexhaustible','Recyclable'],'Non-renewable',['environment']),
    Q('8','Science','Combustion and Flame',Difficulty.Medium,'The temperature at which a substance catches fire is called:',['Ignition point','Boiling point','Melting point','Flash point'],'Ignition point',['chemistry']),
    Q('8','Science','Conservation of Plants and Animals',Difficulty.Easy,'An area reserved for wild animals is called:',['Forest','Wildlife sanctuary','Farm','Plantation'],'Wildlife sanctuary',['environment']),
    Q('8','Science','Cell Structure and Functions',Difficulty.Easy,'The control centre of a cell is the:',['Cytoplasm','Cell membrane','Nucleus','Vacuole'],'Nucleus',['biology']),
    Q('8','Science','Cell Structure and Functions',Difficulty.Medium,'Cell wall is present in:',['Animal cells','Plant cells','Both','Neither'],'Plant cells',['biology']),
    Q('8','Science','Reproduction in Animals',Difficulty.Easy,'Fertilisation that takes place inside the female body is called:',['External fertilisation','Internal fertilisation','Budding','Fragmentation'],'Internal fertilisation',['biology']),
    Q('8','Science','Reaching the Age of Adolescence',Difficulty.Easy,'Adolescence begins at approximately:',['5 years','10 years','20 years','25 years'],'10 years',['biology']),
    Q('8','Science','Force and Pressure',Difficulty.Medium,'The SI unit of pressure is:',['Newton','Pascal','Joule','Watt'],'Pascal',['physics']),
    Q('8','Science','Friction',Difficulty.Easy,'Friction acts in the ___ direction to motion.',['Same','Opposite','Perpendicular','Diagonal'],'Opposite',['physics']),
    Q('8','Science','Sound',Difficulty.Easy,'Sound cannot travel through:',['Air','Water','Steel','Vacuum'],'Vacuum',['physics']),
    Q('8','Science','Sound',Difficulty.Medium,'The number of oscillations per second is called:',['Amplitude','Frequency','Wavelength','Speed'],'Frequency',['physics']),
    Q('8','Science','Chemical Effects of Electric Current',Difficulty.Medium,'Electrolysis of water produces:',['Hydrogen and oxygen','Carbon and oxygen','Nitrogen and oxygen','Hydrogen and nitrogen'],'Hydrogen and oxygen',['chemistry']),
    Q('8','Science','Light',Difficulty.Easy,'White light splits into 7 colours through a:',['Lens','Mirror','Prism','Screen'],'Prism',['physics']),
    Q('8','Science','Stars and the Solar System',Difficulty.Easy,'The closest star to Earth is:',['Alpha Centauri','Sirius','Sun','Proxima Centauri'],'Sun',['astronomy']),

    // === STD 9 MATHS (20 questions) ===
    Q('9','Maths','Number Systems',Difficulty.Easy,'Every rational number is a:',['Natural number','Integer','Real number','Whole number'],'Real number',['numbers']),
    Q('9','Maths','Number Systems',Difficulty.Medium,'√2 is:',['Rational','Irrational','Natural','Integer'],'Irrational',['numbers']),
    Q('9','Maths','Polynomials',Difficulty.Medium,'Degree of 4x³ - 2x² + x - 7 is:',['1','2','3','4'],'3',['algebra']),
    Q('9','Maths','Polynomials',Difficulty.Hard,'Factor of x² - 5x + 6:',['(x-2)(x-4)','(x-2)(x-3)','(x+2)(x+3)','(x+2)(x-3)'],'(x-2)(x-3)',['algebra']),
    Q('9','Maths','Coordinate Geometry',Difficulty.Easy,'Intersection of coordinate axes is called:',['Abscissa','Ordinate','Origin','Quadrant'],'Origin',['geometry']),
    Q('9','Maths','Coordinate Geometry',Difficulty.Medium,'Point (-3, 4) lies in which quadrant?',['I','II','III','IV'],'II',['geometry']),
    Q('9','Maths','Linear Equations in Two Variables',Difficulty.Medium,'2x + 3y = 12 has:',['No solution','One solution','Two solutions','Infinitely many solutions'],'Infinitely many solutions',['algebra']),
    Q('9','Maths','Lines and Angles',Difficulty.Easy,'If two lines are parallel, alternate interior angles are:',['Supplementary','Complementary','Equal','Adjacent'],'Equal',['geometry']),
    Q('9','Maths','Triangles',Difficulty.Easy,'Two triangles are congruent by SAS if:',['Three sides equal','Two sides and included angle equal','Three angles equal','Hypotenuse equal'],'Two sides and included angle equal',['geometry']),
    Q('9','Maths','Triangles',Difficulty.Medium,'In a right triangle, the longest side is the:',['Base','Perpendicular','Hypotenuse','Median'],'Hypotenuse',['geometry']),
    Q('9','Maths','Quadrilaterals',Difficulty.Easy,'A parallelogram has opposite sides that are:',['Equal and parallel','Unequal','Perpendicular','None of these'],'Equal and parallel',['geometry']),
    Q('9','Maths','Circles',Difficulty.Easy,'The longest chord of a circle is its:',['Radius','Arc','Diameter','Tangent'],'Diameter',['geometry']),
    Q('9','Maths','Circles',Difficulty.Medium,'Angle in a semicircle is always:',['45°','60°','90°','180°'],'90°',['geometry']),
    Q('9','Maths','Herons Formula',Difficulty.Medium,'Area of equilateral triangle with side 6 cm:',['9√3','12√3','18√3','6√3'],'9√3',['mensuration']),
    Q('9','Maths','Surface Areas and Volumes',Difficulty.Easy,'Volume of a cuboid = l × b × ?',['h','2h','lh','bh'],'h',['mensuration']),
    Q('9','Maths','Surface Areas and Volumes',Difficulty.Medium,'Surface area of a sphere with radius r:',['πr²','2πr²','3πr²','4πr²'],'4πr²',['mensuration']),
    Q('9','Maths','Statistics',Difficulty.Easy,'Mean of 2, 4, 6, 8, 10:',['5','6','8','10'],'6',['statistics']),
    Q('9','Maths','Statistics',Difficulty.Medium,'Median of 3, 5, 7, 9, 11:',['5','7','9','6'],'7',['statistics']),
    Q('9','Maths','Probability',Difficulty.Easy,'Probability of getting a head on tossing a coin:',['0','1','1/2','1/4'],'1/2',['probability']),
    Q('9','Maths','Probability',Difficulty.Medium,'Probability of rolling a 6 on a die:',['1/4','1/5','1/6','1/3'],'1/6',['probability']),
    // === STD 9 SCIENCE (20 questions) ===
    Q('9','Science','Matter in Our Surroundings',Difficulty.Easy,'Conversion of solid directly to gas is called:',['Evaporation','Sublimation','Condensation','Melting'],'Sublimation',['chemistry']),
    Q('9','Science','Matter in Our Surroundings',Difficulty.Medium,'Which state of matter has fixed volume but no fixed shape?',['Solid','Liquid','Gas','Plasma'],'Liquid',['chemistry']),
    Q('9','Science','Is Matter Around Us Pure',Difficulty.Easy,'A solution is a ___ mixture.',['Heterogeneous','Homogeneous','Saturated','Unsaturated'],'Homogeneous',['chemistry']),
    Q('9','Science','Atoms and Molecules',Difficulty.Easy,'Chemical formula of water is:',['H2O','CO2','HO2','H2O2'],'H2O',['chemistry']),
    Q('9','Science','Atoms and Molecules',Difficulty.Medium,'Relative atomic mass of Carbon is:',['6','12','14','16'],'12',['chemistry']),
    Q('9','Science','Structure of the Atom',Difficulty.Easy,'Protons are found in the:',['Nucleus','Electron cloud','Shell','Orbit'],'Nucleus',['chemistry']),
    Q('9','Science','Structure of the Atom',Difficulty.Medium,'Atomic number of an element represents the number of:',['Neutrons','Protons','Electrons','Nucleons'],'Protons',['chemistry']),
    Q('9','Science','The Fundamental Unit of Life',Difficulty.Easy,'The cell was first discovered by:',['Robert Hooke','Leeuwenhoek','Robert Brown','Schleiden'],'Robert Hooke',['biology']),
    Q('9','Science','The Fundamental Unit of Life',Difficulty.Medium,'Mitochondria is called the powerhouse because:',['It produces DNA','It releases energy','It stores food','It controls cell'],'It releases energy',['biology']),
    Q('9','Science','Tissues',Difficulty.Medium,'Bone is an example of:',['Connective tissue','Epithelial tissue','Muscular tissue','Nervous tissue'],'Connective tissue',['biology']),
    Q('9','Science','Motion',Difficulty.Easy,'Rate of change of displacement is called:',['Speed','Velocity','Acceleration','Distance'],'Velocity',['physics']),
    Q('9','Science','Motion',Difficulty.Medium,'If a car travels 100 m in 10 s, its speed is:',['1000 m/s','10 m/s','100 m/s','0.1 m/s'],'10 m/s',['physics']),
    Q('9','Science','Force and Laws of Motion',Difficulty.Easy,'Newton\'s first law is also called law of:',['Inertia','Momentum','Action','Gravitation'],'Inertia',['physics']),
    Q('9','Science','Force and Laws of Motion',Difficulty.Medium,'SI unit of force is:',['Joule','Watt','Newton','Pascal'],'Newton',['physics']),
    Q('9','Science','Gravitation',Difficulty.Easy,'Value of g on Earth\'s surface is approximately:',['9.8 m/s²','8.9 m/s²','10.5 m/s²','7.8 m/s²'],'9.8 m/s²',['physics']),
    Q('9','Science','Gravitation',Difficulty.Medium,'Weight of an object on Moon is ___ times that on Earth.',['1/2','1/4','1/6','1/8'],'1/6',['physics']),
    Q('9','Science','Work and Energy',Difficulty.Easy,'Work done = Force × ?',['Mass','Displacement','Velocity','Time'],'Displacement',['physics']),
    Q('9','Science','Sound',Difficulty.Easy,'Sound travels fastest in:',['Air','Vacuum','Water','Steel'],'Steel',['physics']),
    Q('9','Science','Natural Resources',Difficulty.Easy,'The main source of energy for Earth is:',['Wind','Water','Sun','Coal'],'Sun',['environment']),
    Q('9','Science','Improvement in Food Resources',Difficulty.Easy,'The process of growing crops is called:',['Horticulture','Agriculture','Sericulture','Aquaculture'],'Agriculture',['environment']),

    // === STD 10 MATHS (20 questions) ===
    Q('10','Maths','Real Numbers',Difficulty.Easy,'HCF of 12 and 18 is:',['2','3','6','9'],'6',['numbers']),
    Q('10','Maths','Real Numbers',Difficulty.Medium,'LCM × HCF = ?',['Sum of numbers','Difference of numbers','Product of numbers','Quotient'],'Product of numbers',['numbers']),
    Q('10','Maths','Polynomials',Difficulty.Easy,'Zero of the polynomial p(x) = 2x + 4 is:',['2','-2','4','-4'],'-2',['algebra']),
    Q('10','Maths','Polynomials',Difficulty.Medium,'Sum of zeros of ax² + bx + c is:',['c/a','-b/a','b/a','-c/a'],'-b/a',['algebra']),
    Q('10','Maths','Pair of Linear Equations in Two Variables',Difficulty.Medium,'If 2x + 3y = 8 and x + y = 3, then x = ?',['1','-1','2','-2'],'1',['algebra']),
    Q('10','Maths','Quadratic Equations',Difficulty.Easy,'Discriminant of ax² + bx + c = 0 is:',['b² - 4ac','b² + 4ac','4ac - b²','a² - 4bc'],'b² - 4ac',['algebra']),
    Q('10','Maths','Quadratic Equations',Difficulty.Medium,'Roots of x² - 5x + 6 = 0 are:',['2 and 3','3 and 4','1 and 6','2 and 4'],'2 and 3',['algebra']),
    Q('10','Maths','Arithmetic Progressions',Difficulty.Easy,'10th term of 2, 7, 12, ... is:',['47','52','37','42'],'47',['progressions']),
    Q('10','Maths','Arithmetic Progressions',Difficulty.Medium,'Sum of first n natural numbers:',['n(n+1)','n(n+1)/2','n²','n(n-1)/2'],'n(n+1)/2',['progressions']),
    Q('10','Maths','Triangles',Difficulty.Easy,'Basic Proportionality Theorem is also called:',['Pythagoras theorem','Thales theorem','Euclid theorem','AA theorem'],'Thales theorem',['geometry']),
    Q('10','Maths','Coordinate Geometry',Difficulty.Easy,'Distance between (0,0) and (3,4) is:',['3','4','5','7'],'5',['geometry']),
    Q('10','Maths','Introduction to Trigonometry',Difficulty.Easy,'sin²θ + cos²θ = ?',['0','1','-1','2'],'1',['trigonometry']),
    Q('10','Maths','Introduction to Trigonometry',Difficulty.Medium,'Value of tan 45° is:',['0','1/√2','1','√3'],'1',['trigonometry']),
    Q('10','Maths','Circles',Difficulty.Easy,'A tangent to a circle is ___ to the radius at the point of contact.',['Parallel','Perpendicular','Equal','Unequal'],'Perpendicular',['geometry']),
    Q('10','Maths','Areas Related to Circles',Difficulty.Medium,'Area of a circle with diameter 14 cm (π=22/7):',['44','154','308','22'],'154',['mensuration']),
    Q('10','Maths','Surface Areas and Volumes',Difficulty.Medium,'Volume of a sphere with radius 3 cm (π=22/7):',['113.1','100','88','226'],'113.1',['mensuration']),
    Q('10','Maths','Statistics',Difficulty.Easy,'Mode is the value that appears:',['Least often','Most often','In the middle','At the start'],'Most often',['statistics']),
    Q('10','Maths','Statistics',Difficulty.Medium,'Median of 11, 12, 13, 14, 15 is:',['11','12','13','14'],'13',['statistics']),
    Q('10','Maths','Probability',Difficulty.Easy,'Sum of all probabilities of sample space = ?',['0','1/2','1','2'],'1',['probability']),
    Q('10','Maths','Probability',Difficulty.Medium,'Probability of drawing a red card from a deck of 52:',['1/4','1/2','1/3','1/52'],'1/2',['probability']),
    // === STD 10 SCIENCE (20 questions) ===
    Q('10','Science','Chemical Reactions and Equations',Difficulty.Easy,'Fe2O3 + 2Al → Al2O3 + 2Fe is an example of:',['Combination','Decomposition','Displacement','Double displacement'],'Displacement',['chemistry']),
    Q('10','Science','Chemical Reactions and Equations',Difficulty.Medium,'Rancidity is caused by ___ of fats and oils.',['Reduction','Oxidation','Sublimation','Precipitation'],'Oxidation',['chemistry']),
    Q('10','Science','Acids Bases and Salts',Difficulty.Easy,'pH of pure water is:',['0','7','14','1'],'7',['chemistry']),
    Q('10','Science','Acids Bases and Salts',Difficulty.Medium,'Baking soda is chemically known as:',['NaCl','NaOH','NaHCO3','Na2CO3'],'NaHCO3',['chemistry']),
    Q('10','Science','Metals and Non-Metals',Difficulty.Easy,'Which metal is liquid at room temperature?',['Iron','Copper','Mercury','Aluminium'],'Mercury',['chemistry']),
    Q('10','Science','Metals and Non-Metals',Difficulty.Medium,'Aluminium is extracted from its ore by:',['Smelting','Electrolysis','Roasting','Reduction'],'Electrolysis',['chemistry']),
    Q('10','Science','Carbon and its Compounds',Difficulty.Easy,'Carbon forms ___ bonds with other atoms.',['Ionic','Covalent','Metallic','Hydrogen'],'Covalent',['chemistry']),
    Q('10','Science','Life Processes',Difficulty.Easy,'The autotrophic mode of nutrition requires:',['CO2 and water only','Sunlight only','Chlorophyll only','All of the above'],'All of the above',['biology']),
    Q('10','Science','Life Processes',Difficulty.Medium,'The organ that filters blood in the human body is:',['Heart','Liver','Kidney','Lungs'],'Kidney',['biology']),
    Q('10','Science','Control and Coordination',Difficulty.Easy,'The basic unit of the nervous system is called:',['Muscle','Neuron','Tissue','Organ'],'Neuron',['biology']),
    Q('10','Science','How Do Organisms Reproduce',Difficulty.Easy,'Binary fission is a mode of reproduction seen in:',['Amoeba','Hydra','Yeast','Humans'],'Amoeba',['biology']),
    Q('10','Science','Heredity and Evolution',Difficulty.Medium,'The term "Genetics" was coined by:',['Darwin','Mendel','Bateson','Morgan'],'Bateson',['biology']),
    Q('10','Science','Light Reflection and Refraction',Difficulty.Easy,'Focal length of a plane mirror is:',['0','Infinity','25 cm','-25 cm'],'Infinity',['physics']),
    Q('10','Science','Light Reflection and Refraction',Difficulty.Medium,'Power of a lens with focal length 25 cm is:',['25 D','4 D','0.25 D','2.5 D'],'4 D',['physics']),
    Q('10','Science','Human Eye and Colourful World',Difficulty.Easy,'The defect where a person cannot see distant objects clearly is:',['Hypermetropia','Myopia','Astigmatism','Presbyopia'],'Myopia',['physics']),
    Q('10','Science','Electricity',Difficulty.Easy,'Ohm\'s law states: V = ?',['IR','I/R','R/I','I²R'],'IR',['physics']),
    Q('10','Science','Electricity',Difficulty.Medium,'Resistance of a wire is directly proportional to its:',['Area','Length and inversely to area','Diameter','Volume'],'Length and inversely to area',['physics']),
    Q('10','Science','Magnetic Effects of Electric Current',Difficulty.Easy,'Magnetic field lines near a bar magnet emerge from:',['South pole','North pole','Middle','Both poles equally'],'North pole',['physics']),
    Q('10','Science','Sources of Energy',Difficulty.Easy,'Solar energy is a ___ source of energy.',['Non-renewable','Renewable','Fossil','Nuclear'],'Renewable',['environment']),
    Q('10','Science','Our Environment',Difficulty.Easy,'The process by which green plants produce food is:',['Respiration','Photosynthesis','Transpiration','Digestion'],'Photosynthesis',['environment']),
    // === STD 11 MATHS (10 questions) ===
    Q('11','Maths','Sets',Difficulty.Easy,'A set with no elements is called:',['Singleton','Null set','Finite set','Universal set'],'Null set',['sets']),
    Q('11','Maths','Sets',Difficulty.Medium,'If A = {1,2,3} and B = {2,3,4}, then A∩B = ?',['{1,2,3,4}','{2,3}','{1,4}','{1,2,3}'],'{2,3}',['sets']),
    Q('11','Maths','Trigonometric Functions',Difficulty.Medium,'Period of sin(x) is:',['π','2π','π/2','3π'],'2π',['trigonometry']),
    Q('11','Maths','Complex Numbers',Difficulty.Medium,'i² = ?',['1','-1','i','-i'],'-1',['algebra']),
    Q('11','Maths','Sequences and Series',Difficulty.Medium,'Sum of first n terms of GP with a=1, r=2: 1+2+4+...+nth is:',['2n','2n-1','2n+1','n²'],'2n-1',['sequences']),
    Q('11','Maths','Straight Lines',Difficulty.Easy,'Slope of line y = 3x + 5 is:',['5','3','-3','-5'],'3',['geometry']),
    Q('11','Maths','Limits and Derivatives',Difficulty.Medium,'d/dx(x²) = ?',['2x','x','x²','2'],'2x',['calculus']),
    Q('11','Maths','Statistics',Difficulty.Medium,'Standard deviation is the square root of:',['Mean','Median','Variance','Range'],'Variance',['statistics']),
    Q('11','Maths','Probability',Difficulty.Easy,'P(A) + P(A\') = ?',['0','1/2','1','2'],'1',['probability']),
    Q('11','Maths','Permutations and Combinations',Difficulty.Medium,'5! = ?',['60','100','120','240'],'120',['combinatorics']),

    // === STD 11 SCIENCE (10 questions) ===
    Q('11','Science','Units and Measurements',Difficulty.Easy,'Light year is a unit of:',['Time','Mass','Distance','Luminosity'],'Distance',['physics']),
    Q('11','Science','Laws of Motion',Difficulty.Easy,'Newton\'s 1st law is about:',['Inertia','Momentum','Action-Reaction','Gravitation'],'Inertia',['physics']),
    Q('11','Science','Work Energy and Power',Difficulty.Medium,'Unit of energy is:',['Watt','Newton','Joule','Pascal'],'Joule',['physics']),
    Q('11','Science','Structure of Atom',Difficulty.Medium,'Quantum model of atom was proposed by:',['Thomson','Rutherford','Bohr','Schrödinger'],'Schrödinger',['chemistry']),
    Q('11','Science','Chemical Bonding',Difficulty.Hard,'Hybridisation in Methane (CH4) is:',['sp','sp²','sp³','dsp²'],'sp³',['chemistry']),
    Q('11','Science','Cell the Unit of Life',Difficulty.Easy,'Powerhouse of cell is:',['Nucleus','Ribosome','Mitochondria','Chloroplast'],'Mitochondria',['biology']),
    Q('11','Science','Photosynthesis in Higher Plants',Difficulty.Medium,'Light reaction of photosynthesis occurs in:',['Stroma','Thylakoid','Cytoplasm','Nucleus'],'Thylakoid',['biology']),
    Q('11','Science','Thermal Properties of Matter',Difficulty.Easy,'SI unit of temperature is:',['Celsius','Fahrenheit','Kelvin','Rankine'],'Kelvin',['physics']),
    Q('11','Science','Waves',Difficulty.Medium,'Speed of sound in air at 0°C is approximately:',['300 m/s','332 m/s','400 m/s','343 m/s'],'332 m/s',['physics']),
    Q('11','Science','Environmental Chemistry',Difficulty.Easy,'The main greenhouse gas is:',['Oxygen','Nitrogen','Carbon dioxide','Argon'],'Carbon dioxide',['environment']),

    // === STD 12 MATHS (10 questions) ===
    Q('12','Maths','Relations and Functions',Difficulty.Easy,'A function f is one-one if:',['f(a)=f(b) ⟹ a≠b','f(a)=f(b) ⟹ a=b','Every element has image','Range=Codomain'],'f(a)=f(b) ⟹ a=b',['functions']),
    Q('12','Maths','Matrices',Difficulty.Medium,'Order of matrix AB if A is 2×3 and B is 3×4:',['2×4','3×3','4×2','2×3'],'2×4',['matrices']),
    Q('12','Maths','Determinants',Difficulty.Easy,'If two rows of determinant are identical, value = ?',['1','-1','0','∞'],'0',['matrices']),
    Q('12','Maths','Integrals',Difficulty.Easy,'∫eˣdx = ?',['eˣ+C','xeˣ+C','eˣ/x+C','ln(x)+C'],'eˣ+C',['calculus']),
    Q('12','Maths','Application of Derivatives',Difficulty.Medium,'If f\'(x) = 0 at x = a, then x = a is called:',['Inflection point','Critical point','Maximum','Minimum'],'Critical point',['calculus']),
    Q('12','Maths','Vector Algebra',Difficulty.Easy,'Dot product of two perpendicular vectors is:',['1','0','-1','Maximum'],'0',['vectors']),
    Q('12','Maths','Three Dimensional Geometry',Difficulty.Medium,'Distance between points (1,2,3) and (4,6,3) is:',['3','5','7','6'],'5',['geometry']),
    Q('12','Maths','Probability',Difficulty.Medium,'Bayes theorem relates:',['Prior and posterior probability','Mean and variance','Permutation and combination','PDF and CDF'],'Prior and posterior probability',['probability']),
    Q('12','Maths','Linear Programming',Difficulty.Easy,'Feasible region in LPP is:',['Unbounded','Bounded convex set','A point','A line'],'Bounded convex set',['optimization']),
    Q('12','Maths','Differential Equations',Difficulty.Medium,'Order of dy/dx + y = x² is:',['0','1','2','3'],'1',['calculus']),

    // === STD 12 SCIENCE (10 questions) ===
    Q('12','Science','Electric Charges and Fields',Difficulty.Easy,'Coulomb\'s law gives force between:',['Masses','Charges','Dipoles','Magnets'],'Charges',['physics']),
    Q('12','Science','Electrostatics',Difficulty.Medium,'Electric field inside a uniformly charged spherical shell is:',['Infinite','Zero','Max at center','Depends on r'],'Zero',['physics']),
    Q('12','Science','Current Electricity',Difficulty.Easy,'Ohm\'s law: V ∝ I when ___ is constant.',['Temperature','Pressure','Length','Area'],'Temperature',['physics']),
    Q('12','Science','Solutions',Difficulty.Medium,'Osmotic pressure is a ___ property.',['Additive','Colligative','Intensive','Extensive'],'Colligative',['chemistry']),
    Q('12','Science','Chemical Kinetics',Difficulty.Hard,'Rate constant depends on:',['Concentration','Temperature','Pressure','Volume'],'Temperature',['chemistry']),
    Q('12','Science','Coordination Compounds',Difficulty.Hard,'Ligands are:',['Electron pair donors','Electron pair acceptors','Proton donors','Neutral molecules only'],'Electron pair donors',['chemistry']),
    Q('12','Science','Genetics and Evolution',Difficulty.Medium,'DNA double helix model was given by:',['Mendel and Morgan','Watson and Crick','Darwin and Lamarck','Beadle and Tatum'],'Watson and Crick',['biology']),
    Q('12','Science','Reproduction in Organisms',Difficulty.Easy,'Cloning produces organisms that are:',['Different','Genetically identical','Hybrid','Mutant'],'Genetically identical',['biology']),
    Q('12','Science','Biotechnology Principles',Difficulty.Hard,'Restriction enzymes cut DNA at specific:',['Random sites','Palindromic sequences','Promoters','Telomeres'],'Palindromic sequences',['biology']),
    Q('12','Science','Environmental Issues',Difficulty.Easy,'BOD stands for:',['Biological Oxygen Demand','Basic Organic Decay','Biochemical Oxidation Degree','Bacterial Oxygen Demand'],'Biological Oxygen Demand',['environment']),
  ];

  let count = 0;
  for (const q of questions) {
    const exists = await prisma.question.findFirst({ where: { content: q.content } });
    if (!exists) { await prisma.question.create({ data: q }); count++; }
  }
  console.log(`Inserted ${count} new questions (batches 1-7).`);

  // ── EXTRA QUESTIONS BATCH (120 more across Std 7-10) ──
  const extraQuestions = [
    // === STD 7 MATHS EXTRA ===
    Q('7','Maths','Integers',Difficulty.Medium,'If a = -3 and b = 4, what is a × b?',['-12','12','7','-7'],'-12',['integers']),
    Q('7','Maths','Integers',Difficulty.Hard,'What is (-100) ÷ 25?',['-4','4','-25','25'],'-4',['integers']),
    Q('7','Maths','Fractions and Decimals',Difficulty.Easy,'1/2 + 1/4 = ?',['3/4','1/6','2/6','3/8'],'3/4',['fractions']),
    Q('7','Maths','Fractions and Decimals',Difficulty.Medium,'3/5 × 10/9 = ?',['2/3','30/45','1/3','5/6'],'2/3',['fractions']),
    Q('7','Maths','Simple Equations',Difficulty.Hard,'If 5x + 10 = 35, then x = ?',['3','4','5','6'],'5',['equations']),
    Q('7','Maths','Lines and Angles',Difficulty.Easy,'Two lines that never meet are called:',['Parallel','Perpendicular','Intersecting','Concurrent'],'Parallel',['geometry']),
    Q('7','Maths','The Triangle and its Properties',Difficulty.Hard,'In triangle ABC, if angle A = 60° and angle B = 80°, then angle C = ?',['30°','40°','50°','60°'],'40°',['triangles']),
    Q('7','Maths','Perimeter and Area',Difficulty.Hard,'Area of a triangle with base 12 cm and height 5 cm is:',['30','60','17','120'],'30',['mensuration']),
    Q('7','Maths','Algebraic Expressions',Difficulty.Hard,'If p = 3, find the value of 2p² - 3p + 1.',['10','8','12','16'],'10',['algebra']),
    Q('7','Maths','Ratio and Proportion',Difficulty.Hard,'A map has scale 1:50000. Distance on map is 3 cm. Actual distance is:',['1.5 km','15 km','150 km','1500 m'],'1.5 km',['proportion']),
    Q('7','Maths','Data Handling',Difficulty.Medium,'If scores are 4, 7, 2, 8, 4, 3, the mode is:',['4','7','2','3'],'4',['statistics']),
    Q('7','Maths','Data Handling',Difficulty.Hard,'Mean of 5 numbers is 12. If one number is removed and mean becomes 10, the removed number is:',['20','18','15','24'],'20',['statistics']),

    // === STD 7 SCIENCE EXTRA ===
    Q('7','Science','Nutrition in Plants',Difficulty.Hard,'Plants that feed on other organisms are called:',['Autotrophs','Heterotrophs','Saprotrophic','Insectivorous'],'Insectivorous',['biology']),
    Q('7','Science','Nutrition in Animals',Difficulty.Medium,'The process of breaking down food into simpler molecules is:',['Absorption','Digestion','Assimilation','Egestion'],'Digestion',['biology']),
    Q('7','Science','Heat',Difficulty.Hard,'A clinical thermometer reads up to:',['100°C','42°C','50°C','37°C'],'42°C',['physics']),
    Q('7','Science','Acids Bases and Salts',Difficulty.Hard,'The pH value of a neutral solution is:',['0','7','14','1'],'7',['chemistry']),
    Q('7','Science','Physical and Chemical Changes',Difficulty.Hard,'Formation of curd from milk is an example of:',['Physical change','Chemical change','Reversible change','No change'],'Chemical change',['chemistry']),
    Q('7','Science','Respiration in Organisms',Difficulty.Easy,'Organisms that respire without oxygen are called:',['Aerobes','Anaerobes','Parasites','Saprophytes'],'Anaerobes',['biology']),
    Q('7','Science','Transportation in Animals and Plants',Difficulty.Hard,'The liquid that transports nutrients in phloem is called:',['Blood','Sap','Lymph','Water'],'Sap',['biology']),
    Q('7','Science','Motion and Time',Difficulty.Hard,'A car travels 90 km in 1.5 hours. Its speed is:',['45 km/h','60 km/h','90 km/h','135 km/h'],'60 km/h',['physics']),
    Q('7','Science','Electric Current and its Effects',Difficulty.Medium,'When current flows through a bulb, it converts electrical energy into:',['Chemical energy','Mechanical energy','Light and heat energy','Sound energy'],'Light and heat energy',['physics']),
    Q('7','Science','Light',Difficulty.Medium,'The phenomenon of bending of light at an interface is called:',['Reflection','Refraction','Dispersion','Diffraction'],'Refraction',['physics']),
    Q('7','Science','Soil',Difficulty.Medium,'Which type of soil is best for growing crops?',['Sandy soil','Clayey soil','Loamy soil','Rocky soil'],'Loamy soil',['environment']),
    Q('7','Science','Forests Our Lifeline',Difficulty.Medium,'The process by which plants release water vapour is:',['Photosynthesis','Transpiration','Respiration','Evaporation'],'Transpiration',['biology']),

    // === STD 8 MATHS EXTRA ===
    Q('8','Maths','Rational Numbers',Difficulty.Hard,'Which property states a + (b + c) = (a + b) + c?',['Commutativity','Associativity','Distributivity','Closure'],'Associativity',['numbers']),
    Q('8','Maths','Linear Equations in One Variable',Difficulty.Hard,'If (x + 3)/5 = 4, then x = ?',['17','13','20','15'],'17',['algebra']),
    Q('8','Maths','Understanding Quadrilaterals',Difficulty.Medium,'A rhombus is a parallelogram with:',['All angles equal','All sides equal','Diagonals equal','Opposite sides unequal'],'All sides equal',['geometry']),
    Q('8','Maths','Understanding Quadrilaterals',Difficulty.Hard,'In a parallelogram, opposite angles are:',['Supplementary','Complementary','Equal','Unequal'],'Equal',['geometry']),
    Q('8','Maths','Squares and Square Roots',Difficulty.Hard,'√(0.0049) = ?',['0.7','0.07','0.007','7'],'0.07',['squares']),
    Q('8','Maths','Cubes and Cube Roots',Difficulty.Hard,'Which of these is a perfect cube?',['100','125','150','200'],'125',['cubes']),
    Q('8','Maths','Comparing Quantities',Difficulty.Hard,'A shopkeeper marks price at 25% above cost and gives 10% discount. Profit % is:',['12.5%','15%','10%','14.5%'],'12.5%',['percentage']),
    Q('8','Maths','Algebraic Expressions and Identities',Difficulty.Medium,'(a - b)² = ?',['a²+b²','a²-b²','a²-2ab+b²','a²+2ab+b²'],'a²-2ab+b²',['algebra']),
    Q('8','Maths','Algebraic Expressions and Identities',Difficulty.Hard,'(a + b)(a - b) = ?',['a²+b²','a²-b²','2ab','(a-b)²'],'a²-b²',['algebra']),
    Q('8','Maths','Mensuration',Difficulty.Hard,'Curved surface area of a cylinder with r=7, h=10 (π=22/7) is:',['440','220','880','154'],'440',['mensuration']),
    Q('8','Maths','Exponents and Powers',Difficulty.Hard,'(2³)² = ?',['32','64','16','128'],'64',['exponents']),
    Q('8','Maths','Direct and Inverse Proportions',Difficulty.Hard,'If x varies directly with y and x=6 when y=4, find x when y=10.',['15','20','12','8'],'15',['proportion']),
    Q('8','Maths','Factorisation',Difficulty.Hard,'Factorise: 6x² + 11x + 3',['(2x+3)(3x+1)','(3x+1)(2x+3)','(6x+1)(x+3)','(x+1)(6x+3)'],'(2x+3)(3x+1)',['algebra']),

    // === STD 8 SCIENCE EXTRA ===
    Q('8','Science','Crop Production and Management',Difficulty.Medium,'The process of loosening and turning the soil is called:',['Ploughing','Sowing','Harvesting','Threshing'],'Ploughing',['biology']),
    Q('8','Science','Microorganisms Friend and Foe',Difficulty.Hard,'Virus that infects bacteria is called:',['Viroid','Bacteriophage','Prion','Retrovirus'],'Bacteriophage',['biology']),
    Q('8','Science','Materials Metals and Non-Metals',Difficulty.Hard,'The only non-metal that is a good conductor of electricity is:',['Sulphur','Carbon (graphite)','Phosphorus','Iodine'],'Carbon (graphite)',['chemistry']),
    Q('8','Science','Coal and Petroleum',Difficulty.Medium,'Coke is obtained from:',['Petroleum','Coal','Natural gas','Wood'],'Coal',['environment']),
    Q('8','Science','Combustion and Flame',Difficulty.Hard,'The innermost zone of a candle flame is:',['Dark zone','Blue zone','Yellow zone','Outer zone'],'Dark zone',['chemistry']),
    Q('8','Science','Cell Structure and Functions',Difficulty.Hard,'The process by which amoeba captures food is:',['Phagocytosis','Pinocytosis','Endocytosis','Diffusion'],'Phagocytosis',['biology']),
    Q('8','Science','Force and Pressure',Difficulty.Hard,'Pressure = Force ÷ ?',['Mass','Area','Volume','Density'],'Area',['physics']),
    Q('8','Science','Friction',Difficulty.Hard,'Friction between a body and a surface when the body is at rest is called:',['Kinetic friction','Static friction','Rolling friction','Fluid friction'],'Static friction',['physics']),
    Q('8','Science','Sound',Difficulty.Hard,'The human ear can hear frequencies between:',['20 Hz to 20000 Hz','2 Hz to 2000 Hz','200 Hz to 20000 Hz','20 Hz to 2000 Hz'],'20 Hz to 20000 Hz',['physics']),
    Q('8','Science','Light',Difficulty.Medium,'Which colour of light has the shortest wavelength?',['Red','Orange','Blue','Violet'],'Violet',['physics']),
    Q('8','Science','Reproduction in Animals',Difficulty.Medium,'The stage between egg and adult in frogs is called:',['Larva','Pupa','Tadpole','Juvenile'],'Tadpole',['biology']),
    Q('8','Science','Stars and the Solar System',Difficulty.Medium,'The nearest planet to the Sun is:',['Earth','Venus','Mercury','Mars'],'Mercury',['astronomy']),

    // === STD 9 MATHS EXTRA ===
    Q('9','Maths','Number Systems',Difficulty.Hard,'The decimal expansion of π is:',['Terminating','Recurring','Non-terminating non-recurring','None'],'Non-terminating non-recurring',['numbers']),
    Q('9','Maths','Polynomials',Difficulty.Hard,'Remainder when p(x) = x³ - 3x² + 4x - 5 is divided by (x-2) is:',['0','-1','1','2'],'-1',['algebra']),
    Q('9','Maths','Coordinate Geometry',Difficulty.Hard,'Distance between (−3, 4) and (3, −4) is:',['6','8','10','12'],'10',['geometry']),
    Q('9','Maths','Linear Equations in Two Variables',Difficulty.Hard,'Which point lies on x + 2y = 6?',['(2,2)','(4,1)','(0,4)','(6,1)'],'(4,1)',['algebra']),
    Q('9','Maths','Lines and Angles',Difficulty.Medium,'If two parallel lines are cut by a transversal, co-interior angles are:',['Equal','Complementary','Supplementary','Vertical'],'Supplementary',['geometry']),
    Q('9','Maths','Triangles',Difficulty.Hard,'In triangle PQR, if PQ = PR, then angles Q and R are:',['Unequal','Supplementary','Complementary','Equal'],'Equal',['geometry']),
    Q('9','Maths','Quadrilaterals',Difficulty.Hard,'The diagonals of a rectangle are:',['Perpendicular','Equal and bisect each other','Unequal','Parallel'],'Equal and bisect each other',['geometry']),
    Q('9','Maths','Circles',Difficulty.Hard,'Equal chords of a circle subtend ___ angles at the centre.',['Unequal','Supplementary','Equal','Complementary'],'Equal',['geometry']),
    Q('9','Maths','Herons Formula',Difficulty.Hard,'Semi-perimeter of a triangle with sides 5, 12, 13 is:',['15','30','13','10'],'15',['mensuration']),
    Q('9','Maths','Surface Areas and Volumes',Difficulty.Hard,'Total surface area of a hemisphere with radius r is:',['2πr²','3πr²','4πr²','πr²'],'3πr²',['mensuration']),
    Q('9','Maths','Statistics',Difficulty.Hard,'The class mark of the class interval 20-30 is:',['20','25','30','10'],'25',['statistics']),
    Q('9','Maths','Probability',Difficulty.Hard,'A bag has 3 red and 5 blue balls. Probability of picking red is:',['3/8','5/8','3/5','1/3'],'3/8',['probability']),

    // === STD 9 SCIENCE EXTRA ===
    Q('9','Science','Matter in Our Surroundings',Difficulty.Hard,'The SI unit of temperature is:',['Celsius','Kelvin','Fahrenheit','Rankine'],'Kelvin',['chemistry']),
    Q('9','Science','Is Matter Around Us Pure',Difficulty.Medium,'Tyndall effect is shown by:',['True solution','Colloid','Suspension','Both colloid and suspension'],'Colloid',['chemistry']),
    Q('9','Science','Is Matter Around Us Pure',Difficulty.Hard,'Separation of cream from milk uses:',['Filtration','Evaporation','Centrifugation','Distillation'],'Centrifugation',['chemistry']),
    Q('9','Science','Atoms and Molecules',Difficulty.Hard,'Number of atoms in one mole of O₂ is:',['6.022×10²³','12.044×10²³','3.011×10²³','1.5×10²³'],'12.044×10²³',['chemistry']),
    Q('9','Science','Structure of the Atom',Difficulty.Hard,'Who proposed the nuclear model of atom?',['Thomson','Rutherford','Bohr','Dalton'],'Rutherford',['chemistry']),
    Q('9','Science','The Fundamental Unit of Life',Difficulty.Hard,'Osmosis is the movement of water from ___ to ___ concentration.',['High,Low','Low,High','Equal,Equal','None of these'],'High,Low',['biology']),
    Q('9','Science','Tissues',Difficulty.Hard,'Xylem transports ___ in plants.',['Food','Water and minerals','Both','Hormones'],'Water and minerals',['biology']),
    Q('9','Science','Motion',Difficulty.Hard,'A body is dropped from rest. Its velocity after 3 seconds (g=10 m/s²) is:',['10 m/s','20 m/s','30 m/s','40 m/s'],'30 m/s',['physics']),
    Q('9','Science','Force and Laws of Motion',Difficulty.Hard,'Momentum = Mass × ?',['Speed','Velocity','Acceleration','Force'],'Velocity',['physics']),
    Q('9','Science','Gravitation',Difficulty.Hard,'Escape velocity from Earth is approximately:',['7.9 km/s','11.2 km/s','3.0 km/s','25 km/s'],'11.2 km/s',['physics']),
    Q('9','Science','Work and Energy',Difficulty.Hard,'A 10 kg object is raised 2 m. Work done against gravity (g=10) is:',['20 J','100 J','200 J','1000 J'],'200 J',['physics']),
    Q('9','Science','Sound',Difficulty.Hard,'Echo is heard when reflected sound reaches after:',['1/10 s','1/5 s','1/20 s','1/50 s'],'1/10 s',['physics']),

    // === STD 10 MATHS EXTRA ===
    Q('10','Maths','Real Numbers',Difficulty.Hard,'Which of these is irrational?',['√4','√9','√16','√3'],'√3',['numbers']),
    Q('10','Maths','Polynomials',Difficulty.Hard,'If α and β are zeros of x² - 5x + 6, then αβ = ?',['5','6','-6','-5'],'6',['algebra']),
    Q('10','Maths','Pair of Linear Equations in Two Variables',Difficulty.Hard,'For no solution: a₁/a₂ = b₁/b₂ ≠ ?',['a₁/a₂','c₁/c₂','b₁/b₂','None of these'],'c₁/c₂',['algebra']),
    Q('10','Maths','Quadratic Equations',Difficulty.Hard,'Nature of roots when discriminant < 0:',['Two real roots','One real root','No real roots','Infinite roots'],'No real roots',['algebra']),
    Q('10','Maths','Arithmetic Progressions',Difficulty.Hard,'Sum of first 20 terms of AP: 1,3,5,...',['400','200','380','420'],'400',['progressions']),
    Q('10','Maths','Triangles',Difficulty.Hard,'In two similar triangles, if ratio of sides is 2:3, ratio of areas is:',['2:3','4:9','3:2','9:4'],'4:9',['geometry']),
    Q('10','Maths','Coordinate Geometry',Difficulty.Hard,'Midpoint of (2,4) and (6,8) is:',['(4,6)','(8,12)','(3,5)','(4,4)'],'(4,6)',['geometry']),
    Q('10','Maths','Introduction to Trigonometry',Difficulty.Hard,'If sin θ = 3/5, then cos θ = ?',['4/5','5/4','3/4','5/3'],'4/5',['trigonometry']),
    Q('10','Maths','Applications of Trigonometry',Difficulty.Hard,'A tower 30 m tall casts a shadow of 30 m. Angle of elevation of sun is:',['30°','45°','60°','90°'],'45°',['trigonometry']),
    Q('10','Maths','Circles',Difficulty.Hard,'If two tangents from external point P are PA and PB, then PA = ?',['Half of PB','Greater than PB','PB','Less than PB'],'PB',['geometry']),
    Q('10','Maths','Areas Related to Circles',Difficulty.Hard,'Area of sector of radius 7 and angle 90° (π=22/7):',['38.5 cm²','77 cm²','154 cm²','11 cm²'],'38.5 cm²',['mensuration']),
    Q('10','Maths','Surface Areas and Volumes',Difficulty.Hard,'A cone with r=3 and h=4 has slant height:',['3','4','5','7'],'5',['mensuration']),

    // === STD 10 SCIENCE EXTRA ===
    Q('10','Science','Chemical Reactions and Equations',Difficulty.Hard,'Which type of reaction is: AB → A + B?',['Combination','Decomposition','Displacement','Double displacement'],'Decomposition',['chemistry']),
    Q('10','Science','Acids Bases and Salts',Difficulty.Hard,'Which gas is produced when HCl reacts with Zn?',['Oxygen','Hydrogen','Chlorine','Nitrogen'],'Hydrogen',['chemistry']),
    Q('10','Science','Metals and Non-Metals',Difficulty.Hard,'Gold and platinum are called noble metals because:',['They are rare','They react with acids','They do not react easily','They are expensive'],'They do not react easily',['chemistry']),
    Q('10','Science','Carbon and its Compounds',Difficulty.Hard,'Homologous series of alkanes has general formula:',['CnH2n','CnH2n-2','CnH2n+2','CnHn'],'CnH2n+2',['chemistry']),
    Q('10','Science','Life Processes',Difficulty.Hard,'Transpiration pull is responsible for transport of:',['Minerals','Water','Food','Hormones'],'Water',['biology']),
    Q('10','Science','Control and Coordination',Difficulty.Hard,'The reflex arc involves:',['Only brain','Only spinal cord','Both brain and spinal cord','Sensory nerve only'],'Only spinal cord',['biology']),
    Q('10','Science','How Do Organisms Reproduce',Difficulty.Hard,'In humans, sex is determined by:',['Mother only','Father only','Both parents','Environment'],'Father only',['biology']),
    Q('10','Science','Heredity and Evolution',Difficulty.Hard,'Mendel\'s law of segregation states:',['Traits blend together','Alleles separate during gamete formation','Dominant traits disappear','Genes don\'t follow patterns'],'Alleles separate during gamete formation',['biology']),
    Q('10','Science','Light Reflection and Refraction',Difficulty.Hard,'A concave mirror has focal length 10 cm. Its radius of curvature is:',['5 cm','10 cm','20 cm','40 cm'],'20 cm',['physics']),
    Q('10','Science','Electricity',Difficulty.Hard,'Three resistors of 3Ω each are connected in parallel. Net resistance is:',['9Ω','3Ω','1Ω','6Ω'],'1Ω',['physics']),
    Q('10','Science','Magnetic Effects of Electric Current',Difficulty.Hard,'Fleming\'s left-hand rule is used to find direction of:',['Current','Magnetic field','Force on conductor','EMF'],'Force on conductor',['physics']),
    Q('10','Science','Sources of Energy',Difficulty.Hard,'Energy released in nuclear fission comes from:',['Chemical bonds','Electrical energy','Mass defect (E=mc²)','Thermal energy'],'Mass defect (E=mc²)',['physics']),
  ];

  let extraCount = 0;
  for (const q of extraQuestions) {
    const exists = await prisma.question.findFirst({ where: { content: q.content } });
    if (!exists) { await prisma.question.create({ data: q }); extraCount++; }
  }
  console.log(`Inserted ${extraCount} extra questions (120 more — harder difficulty coverage).`);

  // Seed default test templates
  const std10Qs = await prisma.question.findMany({ where: { grade: '10', subject: 'Maths' }, take: 5 });
  const std9Qs = await prisma.question.findMany({ where: { grade: '9', subject: 'Science' }, take: 5 });

  if (std10Qs.length > 0) {
    const existing = await prisma.test.findFirst({ where: { title: 'Std 10 Mathematics Assessment' } });
    if (!existing) {
      await prisma.test.create({ data: { title: 'Std 10 Mathematics Assessment', board: 'CBSE', grade: '10', subject: 'Maths', durationMins: 45, totalMarks: std10Qs.length * 5, createdById: admin1.id, status: 'Published', questions: { create: std10Qs.map((q, i) => ({ questionId: q.id, orderIndex: i, marks: 5 })) } } });
      console.log('Seeded Std 10 Maths test.');
    }
  }
  if (std9Qs.length > 0) {
    const existing = await prisma.test.findFirst({ where: { title: 'Std 9 Science Assessment' } });
    if (!existing) {
      await prisma.test.create({ data: { title: 'Std 9 Science Assessment', board: 'CBSE', grade: '9', subject: 'Science', durationMins: 30, totalMarks: std9Qs.length * 5, createdById: admin1.id, status: 'Published', questions: { create: std9Qs.map((q, i) => ({ questionId: q.id, orderIndex: i, marks: 5 })) } } });
      console.log('Seeded Std 9 Science test.');
    }
  }

  const QC = (board: string, grade: string, subject: string, chapter: string, difficulty: Difficulty, content: string, options: string[], correctAnswer: string) => ({
    board, grade, subject, topic: chapter, chapter, difficulty, type: QuestionType.MCQ, content, options, correctAnswer, tags: [chapter.toLowerCase().replace(/\s+/g, '')],
  });

  const batch3 = [
    // 12th CBSE Maths - Relations and Functions (20)
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'Let R be a relation on N defined by x + 2y = 8. The domain of R is:',['{2, 4, 6}','{1, 2, 3, 4}','{2, 4, 6, 8}','{1, 2, 3}'],'{2, 4, 6}'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'A relation R in set A is called reflexive if:',['(a,a) ∈ R for every a ∈ A','(a,b) ∈ R ⟹ (b,a) ∈ R','(a,b),(b,c) ∈ R ⟹ (a,c) ∈ R','None of these'],'(a,a) ∈ R for every a ∈ A'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'A relation R in set A is symmetric if:',['(a,b) ∈ R ⟹ (b,a) ∈ R','(a,a) ∈ R','(a,b) ∈ R ⟹ (a,c) ∈ R','Domain = Range'],'(a,b) ∈ R ⟹ (b,a) ∈ R'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'If f(x) = x² and g(x) = 2x + 1, then f(g(x)) is:',['4x² + 4x + 1','2x² + 1','4x² + 1','2x² + 2x + 1'],'4x² + 4x + 1'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'A function f: A → B is one-one (injective) if:',['f(x₁) = f(x₂) ⟹ x₁ = x₂','Range = Codomain','f is continuous','f is both one-one and onto'],'f(x₁) = f(x₂) ⟹ x₁ = x₂'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'If f: R → R is defined by f(x) = 3x - 4, then f⁻¹(x) is:',['(x+4)/3','(x-4)/3','3x+4','1/(3x-4)'],'(x+4)/3'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'Total number of relations that can be defined from set A of 2 elements to set B of 3 elements is:',['2⁶','2⁵','6²','2³'],'2⁶'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Hard,'Let f: R → R be f(x) = x³ + 5. Then f is:',['One-one and onto','One-one but not onto','Onto but not one-one','Neither one-one nor onto'],'One-one and onto'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'Let R be the relation in the set {1, 2, 3, 4} given by R = {(1,2), (2,2), (1,1), (4,4), (1,3), (3,3), (3,2)}. R is:',['Reflexive and transitive but not symmetric','Reflexive and symmetric but not transitive','Symmetric and transitive but not reflexive','Equivalence relation'],'Reflexive and transitive but not symmetric'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'An equivalence relation is always:',['Reflexive, symmetric and transitive','Only reflexive','Only symmetric','Only transitive'],'Reflexive, symmetric and transitive'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'If f(x) = (x-1)/(x+1), then f(f(x)) equals:',['-1/x','1/x','x','-x'],'-1/x'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'The function f(x) = |x| from R to R is:',['Neither one-one nor onto','One-one and onto','One-one but not onto','Onto but not one-one'],'Neither one-one nor onto'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Hard,'Number of binary operations on a set of 2 elements is:',['16','8','4','2'],'16'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'If A = {1, 2, 3}, then number of equivalence relations containing (1,2) is:',['2','1','3','4'],'2'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'Let f(x) = sin x and g(x) = x². Then g(f(x)) is:',['sin² x','sin x²','sin² x²','x² sin x'],'sin² x'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'A function is invertible if and only if it is:',['Bijective','Injective','Surjective','Continuous'],'Bijective'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'The range of f(x) = 1/(1+x²) is:',['(0, 1]','[0, 1]','(0, ∞)','R'],'(0, 1]'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Hard,'Let R be a relation over the set of real numbers defined by xRy ⟺ |x| = |y|. Then R is:',['An equivalence relation','Reflexive but not symmetric','Symmetric but not transitive','None of these'],'An equivalence relation'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Medium,'If f: R → R is f(x) = [x] (greatest integer function), then f is:',['Neither one-one nor onto','One-one and onto','One-one','Onto'],'Neither one-one nor onto'),
    QC('CBSE','12','Maths','Relations and Functions',Difficulty.Easy,'Identity function on set A is always:',['Bijective','Only injective','Only surjective','Constant function'],'Bijective'),

    // 12th CBSE Physics - Electrostatics (20)
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'SI unit of electric charge is:',['Coulomb','Ampere','Volt','Farad'],'Coulomb'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'The value of 1/(4πε₀) in SI units is:',['9 × 10⁹','8.85 × 10⁻¹²','1.6 × 10⁻¹⁹','6.67 × 10⁻¹¹'],'9 × 10⁹'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'Electric field intensity at a distance r from a point charge Q is proportional to:',['1/r²','1/r','r','r²'],'1/r²'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'Electric potential inside a conducting hollow sphere of radius R carrying charge Q is:',['Constant and equal to potential at surface','Zero','Infinite','Proportional to distance from center'],'Constant and equal to potential at surface'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'Two charges of +1μC and +5μC are placed 4 cm apart. The ratio of forces acting on them is:',['1:1','1:5','5:1','1:25'],'1:1'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'Quantization of charge implies that charge on an object is an integral multiple of:',['e (1.6 × 10⁻¹⁹ C)','1 Coulomb','Mass of electron','Proton mass'],'e (1.6 × 10⁻¹⁹ C)'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'An electric dipole placed in a uniform electric field experiences:',['Torque but no net force','Net force but no torque','Both torque and net force','Neither torque nor net force'],'Torque but no net force'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Hard,'The total electric flux leaving a closed surface enclosing a charge q is:',['q/ε₀','qε₀','zero','4πq/ε₀'],'q/ε₀'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'Capacitance of a parallel plate capacitor increases when:',['Distance between plates is decreased','Area of plates is decreased','Dielectric is removed','Potential difference is increased'],'Distance between plates is decreased'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'SI unit of electric potential is:',['Volt','Joule','Coulomb','Newton/Coulomb'],'Volt'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'Work done in moving a charge q on an equipotential surface is:',['Zero','qV','q/V','Infinite'],'Zero'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Hard,'Energy stored in a capacitor of capacitance C charged to potential V is:',['(1/2)CV²','CV²','(1/2)Q²/V','CV'],'(1/2)CV²'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'If a dielectric slab of dielectric constant K is introduced between plates of a disconnected charged capacitor, its potential difference:',['Decreases K times','Increases K times','Remains unchanged','Becomes zero'],'Decreases K times'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'Electric field lines always intersect conductors at an angle of:',['90°','45°','0°','60°'],'90°'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'Electric dipole moment is a vector quantity directed from:',['Negative charge to positive charge','Positive charge to negative charge','Perpendicular to charges','Center to positive charge'],'Negative charge to positive charge'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Hard,'Three capacitors of 3μF each are connected in series. The equivalent capacitance is:',['1μF','9μF','3μF','1/3 μF'],'1μF'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'Dimensional formula of electric potential is:',['[M L² T⁻³ A⁻¹]','[M L T⁻² A⁻¹]','[M L² T⁻² A]','[M L⁻¹ T⁻² A]'],'[M L² T⁻³ A⁻¹]'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Medium,'A soap bubble is given a negative charge. Its radius will:',['Increase','Decrease','Remain unchanged','Fluctuate'],'Increase'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Hard,'Force between two parallel plates of a capacitor carrying charge Q and area A is:',['Q²/(2Aε₀)','Q²/(Aε₀)','Q/(2Aε₀)','Zero'],'Q²/(2Aε₀)'),
    QC('CBSE','12','Physics','Electrostatics',Difficulty.Easy,'The relative permittivity of air/vacuum is:',['1','0','Infinite','8.85 × 10⁻¹²'],'1'),

    // 11th CBSE Maths - Trigonometry (20)
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'Radian measure of 90° is:',['π/2','π','π/4','2π'],'π/2'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'sin² x + cos² x equals:',['1','0','-1','tan² x'],'1'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'Value of sin 15° is:',['(√3 - 1)/(2√2)','(√3 + 1)/(2√2)','1/2','√3/2'],'(√3 - 1)/(2√2)'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'cos(A + B) equals:',['cos A cos B - sin A sin B','cos A cos B + sin A sin B','sin A cos B + cos A sin B','sin A sin B - cos A cos B'],'cos A cos B - sin A sin B'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'Period of tan x is:',['π','2π','π/2','3π'],'π'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'sin 2A equals:',['2 sin A cos A','sin² A - cos² A','1 - 2 sin² A','2 cos² A - 1'],'2 sin A cos A'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Hard,'Maximum value of 3 sin x + 4 cos x is:',['5','7','1','12'],'5'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'tan(π/4 + x) equals:',['(1 + tan x)/(1 - tan x)','(1 - tan x)/(1 + tan x)','tan x - 1','1 + tan x'],'(1 + tan x)/(1 - tan x)'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'If sin x = 3/5 and x lies in second quadrant, then cos x is:',['-4/5','4/5','-3/5','3/4'],'-4/5'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'Value of cos 20° cos 40° cos 80° is:',['1/8','1/4','1/2','1/16'],'1/8'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Hard,'General solution of sin θ = 0 is:',['nπ','2nπ','nπ + π/2','nπ/2'],'nπ'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'1 - cos 2x equals:',['2 sin² x','2 cos² x','sin² x','cos² x'],'2 sin² x'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'In a triangle ABC, a/sin A equals:',['2R','R','R/2','4R'],'2R'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'Value of tan 75° is:',['2 + √3','2 - √3','√3 + 1','√3 - 1'],'2 + √3'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Hard,'If A + B = 45°, then (1 + tan A)(1 + tan B) equals:',['2','1','0','-1'],'2'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'Range of sin x is:',['[-1, 1]','(-1, 1)','R','[0, 1]'],'[-1, 1]'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'sin 3A equals:',['3 sin A - 4 sin³ A','4 sin³ A - 3 sin A','3 cos A - 4 cos³ A','4 cos³ A - 3 cos A'],'3 sin A - 4 sin³ A'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Hard,'Value of sin(π/10) or sin 18° is:',['(√5 - 1)/4','(√5 + 1)/4','(√3 - 1)/2','1/4'],'(√5 - 1)/4'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Medium,'cos 3A equals:',['4 cos³ A - 3 cos A','3 cos A - 4 cos³ A','3 sin A - 4 sin³ A','4 sin³ A - 3 sin A'],'4 cos³ A - 3 cos A'),
    QC('CBSE','11','Maths','Trigonometry',Difficulty.Easy,'Principal value branch of sin⁻¹ x is:',['[-π/2, π/2]','[0, π]','(-π/2, π/2)','(0, π)'],'[-π/2, π/2]'),

    // 10th CBSE Maths - Arithmetic Progressions (20)
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'The common difference of the AP: 3, 1, -1, -3, ... is:',['-2','2','-1','1'],'-2'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'The nth term of an AP with first term a and common difference d is:',['a + (n-1)d','a + nd','a + (n+1)d','n/2(2a + (n-1)d)'],'a + (n-1)d'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'10th term of the AP: 2, 7, 12, ... is:',['47','52','37','42'],'47'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'Which term of the AP: 21, 18, 15, ... is -81?',['35th','34th','36th','33rd'],'35th'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'Sum of first n terms of an AP is given by:',['n/2[2a + (n-1)d]','n/2[a + l]','Both A and B','None of these'],'Both A and B'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'Sum of first 100 natural numbers is:',['5050','5000','5100','5005'],'5050'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Hard,'If the 3rd term of an AP is 5 and the 7th term is 9, find the common difference.',['1','2','3','4'],'1'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'Find the sum of first 20 odd natural numbers.',['400','420','380','440'],'400'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'If a, b, c are in AP, then:',['b = (a+c)/2','b = a+c','b² = ac','b = 2(a+c)'],'b = (a+c)/2'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'How many two-digit numbers are divisible by 3?',['30','29','31','32'],'30'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Hard,'If sum of first n terms of an AP is 3n² + 5n, its nth term is:',['6n + 2','6n - 2','6n + 5','3n + 2'],'6n + 2'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'The 11th term from the last term of AP: 10, 7, 4, ..., -62 is:',['-32','-35','-30','-28'],'-32'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'If the common difference of an AP is 5, then a₁₈ - a₁₃ is:',['25','20','30','5'],'25'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'The sum of first 15 multiples of 8 is:',['960','900','1000','920'],'960'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Hard,'Three numbers in AP have sum 24. Their middle term is:',['8','6','10','12'],'8'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'Next term of the AP: √2, √8, √18, ... is:',['√32','√24','√36','√40'],'√32'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'If 7 times the 7th term of an AP is equal to 11 times its 11th term, its 18th term will be:',['0','18','77','1'],'0'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Hard,'The first negative term of the AP: 121, 117, 113, ... is:',['32nd term','31st term','33rd term','30th term'],'32nd term'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Medium,'If the nth term of an AP is 2n + 1, the sum of first 3 terms is:',['15','12','18','21'],'15'),
    QC('CBSE','10','Maths','Arithmetic Progressions',Difficulty.Easy,'An AP can have common difference d as:',['Positive, negative or zero','Only positive','Only negative','Only non-zero integer'],'Positive, negative or zero'),

    // 10th CBSE Physics - Human Eye (20)
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'The human eye forms the image of an object at its:',['Retina','Cornea','Iris','Pupil'],'Retina'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'The least distance of distinct vision for a normal adult eye is about:',['25 cm','25 m','2.5 cm','Infinity'],'25 cm'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'The change in focal length of an eye lens is caused by the action of the:',['Ciliary muscles','Pupil','Retina','Iris'],'Ciliary muscles'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'Myopia is also known as:',['Near-sightedness','Far-sightedness','Presbyopia','Astigmatism'],'Near-sightedness'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'Myopia can be corrected by using a:',['Concave lens','Convex lens','Cylindrical lens','Bifocal lens'],'Concave lens'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'Hypermetropia is corrected using a:',['Convex lens','Concave lens','Plane mirror','Prism'],'Convex lens'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'The splitting of white light into its component colours is called:',['Dispersion','Reflection','Refraction','Scattering'],'Dispersion'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'Which colour of light bends the least passing through a glass prism?',['Red','Violet','Blue','Yellow'],'Red'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'Twinkling of stars is due to atmospheric:',['Refraction','Reflection','Dispersion','Internal reflection'],'Refraction'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'The blue colour of the sky is due to:',['Scattering of light','Dispersion of light','Interference','Refraction'],'Scattering of light'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'Advanced sunrise and delayed sunset are caused by:',['Atmospheric refraction','Scattering','Total internal reflection','Dispersion'],'Atmospheric refraction'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Hard,'The ability of the eye lens to adjust its focal length is called:',['Accommodation','Persistence of vision','Power','Adaptation'],'Accommodation'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'A person cannot see distant objects clearly. His vision defect is:',['Myopia','Hypermetropia','Cataract','Presbyopia'],'Myopia'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'The part of the eye that controls the amount of light entering is the:',['Pupil','Retina','Cornea','Optic nerve'],'Pupil'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'Old age hypermetropia resulting from weakening of ciliary muscles is called:',['Presbyopia','Myopia','Astigmatism','Cataract'],'Presbyopia'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Hard,'The condition in which the crystalline lens of people at old age becomes milky and cloudy is:',['Cataract','Presbyopia','Myopia','Glaucoma'],'Cataract'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'Danger signals are red in colour because red light is:',['Scattered least by fog or smoke','Scattered most by fog or smoke','Absorbed most','Reflected least'],'Scattered least by fog or smoke'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Easy,'The light-sensitive screen inside the eye containing rods and cones is:',['Retina','Cornea','Sclera','Choroid'],'Retina'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Medium,'When we enter a dim room from bright sunlight, the pupil size:',['Increases','Decreases','Remains same','Closes completely'],'Increases'),
    QC('CBSE','10','Physics','Human Eye',Difficulty.Hard,'The persistence of vision for a normal human eye is:',['1/16 of a second','1/10 of a second','1/2 of a second','1 second'],'1/16 of a second'),

    // 9th CBSE Maths - Algebra (20)
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'A polynomial of degree 1 is called a:',['Linear polynomial','Quadratic polynomial','Cubic polynomial','Constant polynomial'],'Linear polynomial'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'The coefficient of x² in 2 - x² + x³ is:',['-1','1','2','3'],'-1'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'Zero of the polynomial p(x) = 2x + 5 is:',['-5/2','5/2','2/5','-2/5'],'-5/2'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'If p(x) = x² - 2√2x + 1, then p(2√2) is:',['1','0','8','8 - 4√2'],'1'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'(x + y)² equals:',['x² + 2xy + y²','x² - 2xy + y²','x² + y²','x² - y²'],'x² + 2xy + y²'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'Value of 99² using identity is:',['9801','9901','9701','9891'],'9801'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'Factorise: x² - y²/100',['(x - y/10)(x + y/10)','(x - y/10)²','(x + y/10)²','(x - y)(x + y/100)'],'(x - y/10)(x + y/10)'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Hard,'If x + y + z = 0, then x³ + y³ + z³ equals:',['3xyz','0','xyz','-3xyz'],'3xyz'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'The remainder when x³ + 3x² + 3x + 1 is divided by x + 1 is:',['0','1','8','-1'],'0'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'An equation of the form ax + by + c = 0 is a:',['Linear equation in two variables','Quadratic equation','Cubic equation','Linear equation in one variable'],'Linear equation in two variables'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'Any point on the x-axis is of the form:',['(x, 0)','(0, y)','(x, y)','(x, x)'],'(x, 0)'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'The linear equation 2x - 5y = 7 has:',['Infinitely many solutions','A unique solution','Two solutions','No solution'],'Infinitely many solutions'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'If x = 2, y = 1 is a solution of 2x + 3y = k, then k is:',['7','6','5','8'],'7'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Hard,'Factorise: 2x² + 7x + 3',['(2x + 1)(x + 3)','(2x + 3)(x + 1)','(x + 1)(x + 3)','(2x + 1)(2x + 3)'],'(2x + 1)(x + 3)'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'Degree of the zero polynomial is:',['Not defined','0','1','Any real number'],'Not defined'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'Graph of a linear equation in two variables is always a:',['Straight line','Circle','Parabola','Point'],'Straight line'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'The value of k, if x - 1 is a factor of 4x³ + 3x² - 4x + k is:',['-3','3','1','0'],'-3'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Hard,'Expand: (2x - y + z)²',['4x² + y² + z² - 4xy - 2yz + 4zx','4x² + y² + z² + 4xy + 2yz + 4zx','4x² - y² + z² - 4xy - 2yz + 4zx','None of these'],'4x² + y² + z² - 4xy - 2yz + 4zx'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Medium,'If x + 1/x = 4, then x² + 1/x² equals:',['14','16','18','12'],'14'),
    QC('CBSE','9','Maths','Algebra',Difficulty.Easy,'Which of the following is a polynomial?',['x² + √2x + 3','x + 1/x','√x + 3','x⁻² + 2'],'x² + √2x + 3'),

    // 9th ICSE Science - Heat and Energy (20)
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'SI unit of heat is:',['Joule','Calorie','Celsius','Kelvin'],'Joule'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'1 calorie is approximately equal to:',['4.18 J','1 J','4.18 kJ','100 J'],'4.18 J'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'Heat transfer without any medium is called:',['Radiation','Conduction','Convection','Evaporation'],'Radiation'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'The specific heat capacity of water is:',['4200 J/(kg K)','420 J/(kg K)','1 J/(kg K)','1000 J/(kg K)'],'4200 J/(kg K)'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'Normal temperature of human body in Fahrenheit is:',['98.6°F','37°F','100°F','90°F'],'98.6°F'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'The process in which a liquid changes to vapor at any temperature below its boiling point is:',['Evaporation','Boiling','Sublimation','Condensation'],'Evaporation'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'Good absorbers of heat are also good:',['Emitters','Reflectors','Insulators','Conductors'],'Emitters'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'Thermal capacity of a body depends on its:',['Mass and specific heat capacity','Volume only','Density only','Shape and size'],'Mass and specific heat capacity'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Hard,'Amount of heat required to change the phase of a unit mass of substance at constant temperature is:',['Latent heat','Specific heat','Thermal capacity','Water equivalent'],'Latent heat'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'Land and sea breezes are examples of heat transfer by:',['Convection','Conduction','Radiation','All of these'],'Convection'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'At what temperature do the Celsius and Fahrenheit scales read the same?',['-40°','0°','100°','-32°'],'-40°'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'A vacuum flask prevents heat loss due to:',['Conduction, convection and radiation','Only conduction','Only radiation','Only convection'],'Conduction, convection and radiation'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Hard,'Greenhouse effect is primarily caused by trapping of:',['Infrared radiations','Ultraviolet radiations','X-rays','Microwaves'],'Infrared radiations'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'Black surfaces are poor:',['Reflectors of heat','Absorbers of heat','Emitters of heat','Conductors of heat'],'Reflectors of heat'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'Boiling point of pure water at standard pressure is:',['100°C','0°C','273 K','37°C'],'100°C'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'When ice melts, its volume:',['Decreases','Increases','Remains same','First increases then decreases'],'Decreases'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Hard,'Water equivalent of a body is measured in:',['kg','Joule','J/°C','Calorie'],'kg'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'Absolute zero temperature corresponds to:',['0 K or -273.15°C','0°C','100 K','-100°C'],'0 K or -273.15°C'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Medium,'Energy released during condensation of vapor is called latent heat of:',['Vaporization','Fusion','Sublimation','Melting'],'Vaporization'),
    QC('ICSE','9','Science','Heat and Energy',Difficulty.Easy,'Which instrument measures temperature?',['Thermometer','Barometer','Calorimeter','Hygrometer'],'Thermometer'),

    // 8th Foundation Physics - Light (20)
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Light travels in a:',['Straight line','Curved path','Zig-zag path','Circular path'],'Straight line'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Angle of incidence is equal to angle of reflection. This is the:',['Law of reflection','Law of refraction','Snell\'s law','Dispersion law'],'Law of reflection'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'The image formed by a plane mirror is:',['Virtual, erect and of same size','Real, inverted and diminished','Real, erect and magnified','Virtual, inverted and same size'],'Virtual, erect and of same size'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Bending of light rays when entering from one medium to another is called:',['Refraction','Reflection','Dispersion','Diffraction'],'Refraction'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'Speed of light in vacuum is:',['3 × 10⁸ m/s','3 × 10⁶ m/s','332 m/s','1.5 × 10⁸ m/s'],'3 × 10⁸ m/s'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Which colour of light has the longest wavelength?',['Red','Violet','Blue','Green'],'Red'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'An object placed between two parallel plane mirrors produces:',['Infinite images','Two images','One image','Four images'],'Infinite images'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Splitting of white light into 7 colours is called:',['Dispersion','Refraction','Reflection','Interference'],'Dispersion'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'Periscope works on the principle of:',['Successive reflections','Refraction','Total internal reflection','Dispersion'],'Successive reflections'),
    QC('Foundation','8','Physics','Light',Difficulty.Hard,'The human eye lens is a:',['Convex lens','Concave lens','Cylindrical lens','Bifocal lens'],'Convex lens'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Transparent front part of the eye is called:',['Cornea','Retina','Iris','Pupil'],'Cornea'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'Kaleidoscope forms beautiful patterns due to:',['Multiple reflections','Refraction','Dispersion','Scattering'],'Multiple reflections'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Shadows are formed because light:',['Travels in straight lines','Can bend around corners','Is a wave','Carries energy'],'Travels in straight lines'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'Lateral inversion is observed in a:',['Plane mirror','Convex lens','Glass slab','Prism'],'Plane mirror'),
    QC('Foundation','8','Physics','Light',Difficulty.Hard,'Braille system is used by individuals with:',['Visual impairment','Hearing loss','Speech loss','Physical disability'],'Visual impairment'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'When a light ray goes from denser to rarer medium, it bends:',['Away from normal','Towards normal','Goes un-deviated','Reflects back'],'Away from normal'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'The primary source of light for Earth is the:',['Sun','Moon','Stars','Electricity'],'Sun'),
    QC('Foundation','8','Physics','Light',Difficulty.Medium,'A polished surface causes:',['Regular reflection','Irregular reflection','Diffused reflection','Refraction'],'Regular reflection'),
    QC('Foundation','8','Physics','Light',Difficulty.Hard,'If the angle between incident ray and plane mirror is 30°, the angle of reflection is:',['60°','30°','90°','120°'],'60°'),
    QC('Foundation','8','Physics','Light',Difficulty.Easy,'Objects that emit their own light are called:',['Luminous','Non-luminous','Opaque','Translucent'],'Luminous'),

    // 8th Foundation Maths - Rational Numbers (20)
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'A rational number can be represented in the form p/q where q is:',['Not equal to zero','Equal to zero','Only positive integer','Only prime number'],'Not equal to zero'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Additive inverse of -5/7 is:',['5/7','7/5','-7/5','0'],'5/7'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Multiplicative inverse (reciprocal) of 2/3 is:',['3/2','-2/3','-3/2','1'],'3/2'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'The rational number that does not have a reciprocal is:',['0','1','-1','None of these'],'0'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Product of a rational number and its reciprocal is always:',['1','0','-1','The number itself'],'1'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Between any two distinct rational numbers, there are:',['Infinitely many rational numbers','Exactly one rational number','No rational number','Ten rational numbers'],'Infinitely many rational numbers'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Zero is a:',['Rational number','Irrational number','Natural number','Negative integer'],'Rational number'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Value of 1/2 + 1/3 is:',['5/6','2/5','1/5','1/6'],'5/6'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Hard,'Which property is represented by a × (b + c) = a×b + a×c?',['Distributivity','Associativity','Commutativity','Closure'],'Distributivity'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Standard form of -18/45 is:',['-2/5','-9/15','-6/15','2/5'],'-2/5'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Multiplicative identity for rational numbers is:',['1','0','-1','Does not exist'],'1'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Additive identity for rational numbers is:',['0','1','-1','The number itself'],'0'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Hard,'Find value of (-3/5) × (5/7)',['-3/7','3/7','-15/35','1'],'-3/7'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Which of the following is strictly negative?',['-2/3','(-2)/(-3)','0','|-5/7|'],'-2/3'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'If x + 2/3 = 1, then x equals:',['1/3','-1/3','5/3','2/3'],'1/3'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Hard,'Rational number halfway between 1/4 and 1/2 is:',['3/8','1/3','2/6','5/8'],'3/8'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Are rational numbers closed under division?',['No, division by zero is not defined','Yes, always','Only for positive numbers','Only for fractions'],'No, division by zero is not defined'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Medium,'Reciprocal of -1 is:',['-1','1','0','Does not exist'],'-1'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Hard,'Simplify: (2/5) ÷ (1/5)',['2','1/2','1/5','5/2'],'2'),
    QC('Foundation','8','Maths','Rational Numbers',Difficulty.Easy,'Every integer is a:',['Rational number','Whole number only','Natural number only','Irrational number'],'Rational number'),

    // 7th CBSE Maths - Integers and Fractions (20)
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'(-3) + (-7) equals:',['-10','10','-4','4'],'-10'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'(-5) × 4 equals:',['-20','20','-1','9'],'-20'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'(-20) ÷ (-5) equals:',['4','-4','15','-15'],'4'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'Product of two negative integers is always:',['Positive','Negative','Zero','Undefined'],'Positive'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Which integer is neither positive nor negative?',['0','1','-1','None'],'0'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Value of |-8| + |-2| is:',['10','6','-10','-6'],'10'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Hard,'(-1)¹⁰¹ equals:',['-1','1','0','101'],'-1'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'A fraction whose numerator is strictly less than denominator is a:',['Proper fraction','Improper fraction','Mixed fraction','Unit fraction'],'Proper fraction'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'Equivalent fraction of 2/3 with denominator 12 is:',['8/12','6/12','4/12','10/12'],'8/12'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Reciprocal of a proper fraction is always an:',['Improper fraction','Proper fraction','Whole number','Negative number'],'Improper fraction'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Value of 2/5 × 5/2 is:',['1','0','4/25','25/4'],'1'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Hard,'Simplify: 3 ÷ (1/3)',['9','1','1/9','3'],'9'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Express 2.5 as a fraction in lowest terms.',['5/2','25/10','1/4','2/5'],'5/2'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'0.2 × 0.3 equals:',['0.06','0.6','0.006','6'],'0.06'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Subtracting -5 from 10 gives:',['15','5','-5','-15'],'15'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Hard,'If 3/4 of a number is 12, the number is:',['16','9','15','20'],'16'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'Smallest positive integer is:',['1','0','Does not exist','2'],'1'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Medium,'Add: 1/4 + 1/2',['3/4','2/6','1/6','5/8'],'3/4'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Hard,'Division of a fraction by zero is:',['Not defined','Zero','One','Infinity'],'Not defined'),
    QC('CBSE','7','Maths','Integers and Fractions',Difficulty.Easy,'Which is greater: -2 or -5?',['-2','-5','Both equal','Cannot compare'],'-2'),
  ];

  let b3Count = 0;
  for (const q of batch3) {
    const exists = await prisma.question.findFirst({ where: { content: q.content } });
    if (!exists) { await prisma.question.create({ data: q }); b3Count++; }
  }
  console.log(`Inserted ${b3Count} specific user-requested questions (Batch 3).`);

  // --- Auto Create the 10 Specific Tests ---
  const specs = [
    { title: '12th CBSE Maths: Relations and Functions', board: 'CBSE', grade: '12', subject: 'Maths', chap: 'Relations and Functions', dur: 80 },
    { title: '12th CBSE Physics: Electrostatics', board: 'CBSE', grade: '12', subject: 'Physics', chap: 'Electrostatics', dur: 80 },
    { title: 'Grade 11 Maths: Trigonometry Test', board: 'CBSE', grade: '11', subject: 'Maths', chap: 'Trigonometry', dur: 30 },
    { title: '10th CBSE Maths: Arithmetic Progressions', board: 'CBSE', grade: '10', subject: 'Maths', chap: 'Arithmetic Progressions', dur: 60 },
    { title: '10th CBSE Physics: Human Eye Assessment', board: 'CBSE', grade: '10', subject: 'Physics', chap: 'Human Eye', dur: 60 },
    { title: '9th CBSE Maths: Algebra Foundations', board: 'CBSE', grade: '9', subject: 'Maths', chap: 'Algebra', dur: 30 },
    { title: '9th ICSE Science: Heat and Energy MCQs', board: 'ICSE', grade: '9', subject: 'Science', chap: 'Heat and Energy', dur: 30 },
    { title: '8th Foundation Physics: Light Test', board: 'Foundation', grade: '8', subject: 'Physics', chap: 'Light', dur: 30 },
    { title: '8th Foundation Maths: Rational Numbers', board: 'Foundation', grade: '8', subject: 'Maths', chap: 'Rational Numbers', dur: 30 },
    { title: '7th CBSE Maths: Integers and Fractions', board: 'CBSE', grade: '7', subject: 'Maths', chap: 'Integers and Fractions', dur: 30 },
  ];

  for (const sp of specs) {
    const tExists = await prisma.test.findFirst({ where: { title: sp.title } });
    if (!tExists) {
      // Find matching questions
      const qs = await prisma.question.findMany({
        where: { board: sp.board, grade: sp.grade, subject: sp.subject, chapter: sp.chap },
        take: 20,
      });

      if (qs.length > 0) {
        await prisma.test.create({
          data: {
            title: sp.title,
            board: sp.board,
            grade: sp.grade,
            subject: sp.subject,
            durationMins: sp.dur,
            totalMarks: qs.length * 1, // 1 mark per MCQ
            createdById: admin1.id,
            status: 'Published',
            questions: {
              create: qs.map((qObj, idx) => ({
                questionId: qObj.id,
                orderIndex: idx,
                marks: 1,
              })),
            },
          },
        });
        console.log(`Auto-published test: "${sp.title}" with ${qs.length} MCQs.`);
      }
    }
  }

  // --- Seed default batches ---
  const batchSpecs = [
    { name: '12th CBSE Batch', grade: '12', board: 'CBSE', code: 'CBSE12' },
    { name: '11th CBSE Batch', grade: '11', board: 'CBSE', code: 'CBSE11' },
    { name: '10th CBSE Batch', grade: '10', board: 'CBSE', code: 'CBSE10' },
    { name: '9th CBSE Batch', grade: '9', board: 'CBSE', code: 'CBSE9' },
    { name: '9th ICSE Batch', grade: '9', board: 'ICSE', code: 'ICSE9' },
    { name: '8th Foundation Batch', grade: '8', board: 'Foundation', code: 'FND8' },
    { name: '7th CBSE Batch', grade: '7', board: 'CBSE', code: 'CBSE7' },
  ];

  for (const bs of batchSpecs) {
    const exists = await prisma.batch.findFirst({ where: { inviteCode: bs.code } });
    if (!exists) {
      const batch = await prisma.batch.create({
        data: { name: bs.name, grade: bs.grade, board: bs.board, inviteCode: bs.code, createdById: admin1.id, description: `Default batch for Grade ${bs.grade} ${bs.board} students` },
      });
      // Auto-enroll matching demo students
      const matchingStudents = await prisma.user.findMany({ where: { role: 'Student', grade: bs.grade, board: bs.board }, select: { id: true } });
      for (const s of matchingStudents) {
        await prisma.batchEnrollment.create({ data: { batchId: batch.id, studentId: s.id } }).catch(() => {});
      }
      console.log(`Seeded batch: "${bs.name}" with ${matchingStudents.length} students.`);
    }
  }

  console.log('Seed complete.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
