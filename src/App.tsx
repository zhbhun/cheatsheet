import { useEffect, useState } from 'react';
import * as yaml from 'yaml';

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
      <button
        className="text-red-500"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </button>
    </>
  );
}

export default App;
