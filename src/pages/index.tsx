import { DefaultHead } from '@/components/DefaultHead'
import styles from '@/styles/Index.module.css'
import { useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { calculateFieldSpace, getDataStructs } from '@/util/parseAnchorSpace';


export default function Home() {
  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}'`);
  const [theme, setTheme] = useState("dark");

  return (
    <>
      <DefaultHead />

      <div style={{ marginTop: "50px" }} className={styles.flexDown}>
        <h1 className={styles.headText}>Anchor Space Calculator</h1>
        <h2 className={styles.subText}>Paste your Anchor Account Structure Rust Code to Get its Space Requirements.</h2>


        <div className={styles.flexRow} style={{ marginTop: "50px" }}>

          <div className={styles.flexDown}>
            <p>Anchor Rust Code</p>
            <Editor
              height="60vh"

              theme="vs-dark"
              width="40rem"
              defaultLanguage="rust"
              defaultValue={code}
              onChange={(value) => setCode(value!)}
            />

          </div>


          <div className={styles.flexDown} style={{
            width: "40rem"
          }}>
            <p>Calculated Space</p>
            {code && JSON.stringify(calculateFieldSpace(getDataStructs(code)))}
          </div>

        </div>
      </div>
    </>
  )
}
