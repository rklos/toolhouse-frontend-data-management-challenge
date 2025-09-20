import { v4 as uuidv4 } from 'uuid';

const STATUS_LIST = ['active', 'archived', 'draft'];
const getRandomStatus = () => STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)];

const startDate = new Date('2021-01-01');
const endDate = new Date('2025-09-20');
const getRandomISOString = () => new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toISOString();

const ITEMS_COUNT = 200;

const items = Array.from({ length: ITEMS_COUNT }, (_, i) => ({
  id: uuidv4(),
  name: `Item ${i + 1}`,
  description: `Description ${i + 1}`,
  createdAt: getRandomISOString(),
  status: getRandomStatus(),
}));

export default items;
