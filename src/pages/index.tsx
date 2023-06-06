import { DefaultHead } from '@/components/DefaultHead'
import styles from '@/styles/Index.module.css'
import { useEffect, useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { calculateFieldSpace, getDataStructs } from '@/util/parseAnchorSpace';
import SpaceTable from '@/components/Table';
import { Text } from '@chakra-ui/react';


export default function Home() {
  const [code, setCode] = useState(`
  #[account]
  #[derive(Default)]
  pub struct BankAccount {
    pub holder: Pubkey,
    pub holder_name: String,
    pub balance: f64,
    pub thread_id: Vec<u8>,
    pub created_at: i64,
    pub updated_at: i64,
}
  `);
  const [spaceData, setSpaceData] = useState<any>();


  useEffect(() => {
    setData(code)
  }, [])

  const setData = (code: string) => {
    setCode(code)
    const structsData = getDataStructs(code)
    if (!structsData) {
      setSpaceData(null)
      return
    }
    const space = calculateFieldSpace(structsData)
    setSpaceData(space)
  }
  return (
    <>
      <DefaultHead />

      <div style={{ marginTop: "30px" }} className={styles.flexDown}>
        <h1 className={styles.headText}>Anchor Space Calculator</h1>
        <h2 className={styles.subText}>Paste your Anchor Account Structure Rust Code to Get its Space Requirements.</h2>


        <div className={styles.flexRow} style={{
          alignItems: "start",
          marginTop:"30px"
        }}>

          <div className={styles.flexDown}>
            <p style={{
              color: "#4C5273",
              fontWeight: "600",
              fontSize: "1.6rem"
            }}>Anchor Rust Code</p>
            <Editor
              height="70vh" 
              
              theme="vs-dark"
              width="40rem"
              defaultLanguage="rust"
              defaultValue={code}
              onChange={(value) => setData(value!)}
            />

          </div>


          <div className={styles.flexDown} style={{
            width: "40rem"
          }}>
            <p style={{
              color: "#4C5273",
              fontWeight: "600",
              fontSize: "1.6rem"
            }}>Calculated Space</p>
            {spaceData ? <SpaceTable spaceData={spaceData} /> :
              <Text color="gray.500" fontSize="30px">Paste Valid Anchor Rust Account Struct Code to Get Started</Text>}
          </div>

        </div>
      </div>
    </>
  )
}
