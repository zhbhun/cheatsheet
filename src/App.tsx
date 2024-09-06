import { useEffect, useState } from 'react';
import * as yaml from 'yaml';
import { Button } from '@nextui-org/button';

function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    import('@/data/typescript/index.yaml?raw').then(({ default: content }) => {
      console.log(content);
      console.log(yaml.parse(content));
    });
  }, []);

  return (
    <>
      <Button color="primary" onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
    </>
  );
}

export default App;
