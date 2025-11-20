import { UserRole, User } from '@transv2/shared';

const role: UserRole = UserRole.USER;
const user: User = {
  id: '1',
  username: 'test',
  email: 'test@test.com',
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('Import test', role, user);
