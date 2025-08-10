import app from '@/app';
import getEnv from '@/util/getEnv';

const PORT = getEnv('SERVER_PORT') ?? 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
