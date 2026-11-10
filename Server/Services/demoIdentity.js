const touristFirst = ['Alex', 'Sofia', 'Daniel', 'Mila', 'Lucas', 'Amira', 'Noah', 'Leila', 'Oliver', 'Clara', 'Zoe', 'Ethan', 'Maya', 'Samir', 'Isabella', 'Theo', 'Nina', 'Adam', 'Elena', 'Rami'];
const touristLast = ['Morgan', 'Reed', 'Bennett', 'Parker', 'Hayes', 'Turner', 'Brooks', 'Foster', 'Carter', 'Collins', 'Murphy', 'Ward', 'Price', 'Cooper', 'Bailey'];
const guideNames = [
  'Mariam Hassan', 'Omar El-Sayed', 'Nourhan Khalil', 'Karim Fawzy', 'Salma Nabil', 'Youssef Amin',
  'Hana Abdelrahman', 'Tarek Mahmoud', 'Dina Samir', 'Mostafa Adel', 'Layla Farouk', 'Amr Hegazy',
  'Nadine Rami', 'Ahmed Zaki', 'Rana Ibrahim', 'Khaled Saad', 'Mona Sherif', 'Yasmin Hossam',
  'Peter Girgis', 'Farida Emad', 'Hassan Galal', 'Maya Fathi', 'Ibrahim Sayed', 'Nour Ezzat', 'Adel Mansour',
];

function naturalNameAt(index) {
  return `${touristFirst[index % touristFirst.length]} ${touristLast[Math.floor(index / touristFirst.length) % touristLast.length]}`;
}

function* demoAccounts() {
  for (let index = 1; index <= 100; index++) {
    yield { email: `demo.tourist.${String(index).padStart(3, '0')}@rafiq.test`, preferredName: naturalNameAt(index - 1), fallbackIndex: index - 1, avatarIndex: index - 1 };
  }
  for (let index = 1; index <= 25; index++) {
    yield { email: `demo.guide.${String(index).padStart(2, '0')}@rafiq.test`, preferredName: guideNames[index - 1], fallbackIndex: 200 + index - 1, avatarIndex: 100 + index - 1 };
  }
  for (let index = 1; index <= 5; index++) {
    yield { email: `demo.pending.${String(index).padStart(2, '0')}@rafiq.test`, preferredName: naturalNameAt(99 + index), fallbackIndex: 99 + index, avatarIndex: 125 + index - 1 };
  }
}

function buildDemoIdentityPlan(avatarFiles, reservedNames = []) {
  if (!Array.isArray(avatarFiles) || avatarFiles.length === 0) {
    throw new Error('Demo identity mapping requires the existing avatar files.');
  }

  const usedNames = new Set(reservedNames.map((name) => String(name || '').trim().toLocaleLowerCase()));
  const identities = new Map();
  for (const account of demoAccounts()) {
    const candidates = [account.preferredName];
    for (let offset = 0; offset < touristFirst.length * touristLast.length; offset++) {
      candidates.push(naturalNameAt(account.fallbackIndex + offset));
    }
    const name = candidates.find((candidate) => {
      const normalized = candidate.trim().toLocaleLowerCase();
      if (usedNames.has(normalized)) return false;
      usedNames.add(normalized);
      return true;
    });
    if (!name) throw new Error('Could not find a unique fictional demo name.');

    const file = avatarFiles[account.avatarIndex % avatarFiles.length];
    identities.set(account.email, {
      name,
      avatarUrl: `/avatars/${encodeURIComponent(file)}`,
    });
  }
  return identities;
}

module.exports = { buildDemoIdentityPlan };
