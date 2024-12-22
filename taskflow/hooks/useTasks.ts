import { useQuery } from 'react-query';
import axios from 'axios';

const fetchTasks = async () => {
  const { data } = await axios.get('/api/tasks');
  return data;
};

const useTasks = () => {
  return useQuery('tasks', fetchTasks);
};

export default useTasks;