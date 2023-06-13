import { spaceReference } from "@/util/parseAnchorSpace";
import { CopyIcon } from "@chakra-ui/icons";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  Divider,
  NumberInputField,
  NumberInput,
  Box,
  useToast,
  Button
} from "@chakra-ui/react";
import { useState } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';

type SpaceData = {
  type: string;
  space: number;
  prefix_space: number;
};

const TableComponent: React.FC<{ spaceData: Record<string, SpaceData> }> = ({ spaceData }) => {
  const [additionalSpace, setAdditionalSpace] = useState<Record<string, number>>({});
  const [showCode, setShowCode] = useState<boolean>(false)

  const handleAdditionalSpaceChange = (field: number, value: string) => {
    setAdditionalSpace((prevState) => ({
      ...prevState,
      [field]: Number(value),
    }));
  };

  const toast = useToast()

  const renderSpaceValue = ({ type, space, prefix_space }: SpaceData) => {
    const additionalSpaceValue = additionalSpace[space] || 0;

    if (prefix_space) {
      if (type === "String") {
        return `(${prefix_space} + ${space || additionalSpaceValue})`;
      } else {
        let totalSpace = `(${prefix_space} + ${space}`;

        if (type.startsWith("Vec<") && additionalSpaceValue) {
          totalSpace += ` * ${additionalSpaceValue})`;
        } else {
          totalSpace += ")";
        }
        return totalSpace;
      }
    } else {
      return `${space}`;
    }
  };

  const calculateTotalSpace = () => {
    let totalSpace = "8 + ";
    const spaceValues = Object.values(spaceData);

    spaceValues.forEach(({ type, space, prefix_space }, index) => {
      const additionalSpaceValue = additionalSpace[space] || 0;

      if (prefix_space) {
        if (type === "String") {
          totalSpace += `(${prefix_space} + ${space || additionalSpaceValue})`;
        } else {
          totalSpace += `(${prefix_space} + ${space}`;

          if (type.startsWith("Vec<") && additionalSpaceValue) {
            totalSpace += ` * ${additionalSpaceValue})`;
          } else {
            totalSpace += ")";
          }
        }
      } else {
        totalSpace += `${space}`;
      }

      if (index !== spaceValues.length - 1) {
        totalSpace += " + ";
      }
    });

    return totalSpace;
  };


  const calculateTotalBytes = () => {
    let totalBytes = 8;
    Object.values(spaceData).forEach(({ space, prefix_space, type }) => {
      const additionalSpaceValue = additionalSpace[space] || 0;
      if (type.startsWith("Vec<") && additionalSpace) {
        totalBytes += (space * additionalSpaceValue) + prefix_space;
      } else {
        totalBytes += space + additionalSpaceValue + prefix_space;

      }
    });
    return totalBytes;
  };

  const generateRustCodeWithComments = () => {
    let rustCode = 'impl MyData {\n    pub const SIZE: usize =\n';
    Object.entries(spaceData).forEach(([fieldName, { space, prefix_space, type }]) => {
      const additionalSpaceValue = additionalSpace[space] || 0;

      if (prefix_space) {
        if (type === "String") {
          rustCode += `    + (${prefix_space} + ${space || additionalSpaceValue}) // ${fieldName}\n`;
        } else {
          rustCode += `    + (${prefix_space} + ${space}`;
          if (type.startsWith("Vec<") && additionalSpaceValue) {
            rustCode += ` * ${additionalSpaceValue}) // ${fieldName}\n`;
          } else {
            rustCode += ") // " + fieldName + "\n";
          }
        }
      } else {
        rustCode += `    + ${space} // ${fieldName}\n`;
      }
    });

    return rustCode;

  };


  return (
    <>
      <Flex bg="#0E0E17" w="100%" pos="relative" maxH="70vh" flexFlow="column" p="10px 20px" rounded="10px">
        <Flex w="100%" justify="space-between" mb="1rem">
          <Button h="2.2rem" w="50%" colorScheme="facebook" _hover={{ bg: "none" }} onClick={() => setShowCode(false)} variant={showCode ? "outline" : "solid"}>Space Breakdown</Button>
          <Button h="2.2rem" w="50%" colorScheme="facebook" _hover={{ bg: "none" }} onClick={() => setShowCode(true)} variant={!showCode ? "outline" : "solid"}>Rust Code</Button>
        </Flex>

        {showCode ? <>
          <SyntaxHighlighter language="rust" customStyle={{fontSize:"1.3rem", background:'#0E0E17'}}>
            {generateRustCodeWithComments()}
          </SyntaxHighlighter>

        </> : <>

          <Text fontSize="20px" color="#60569E">Space Required</Text>

          <Flex justify="space-between" align="center">
            <Text fontSize="25px" color="white" fontWeight={800}>{calculateTotalSpace()}</Text>
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(calculateTotalSpace())
                toast({
                  status: "success",
                  title: "Successfully copied space"
                })
              }}
              color="white" w="2rem" h="2rem" sx={{ cursor: "pointer" }}
            />
          </Flex>


          <Divider borderColor="gray.800" my='10px' />
          <Text fontSize="20px" color="#60569E">Total Byte Space</Text>
          <Text fontSize="25px" color="white" fontWeight={700}>{calculateTotalBytes()} Bytes</Text>


          <Divider borderColor="gray.800" my='10px' />
          <Text fontSize="20px" color="#60569E" mb="10px">Breakdown</Text>


          <Box overflowX="auto" flex="1">
            <Table bg="#161723" variant="simple" colorScheme="purple" rounded="10px">
              <Thead pos="static">
                <Tr pos="static">
                  <Th pos="static" color="#599CFF" fontSize="15px">Field</Th>
                  <Th color="#599CFF" fontSize="15px">Type</Th>
                  <Th color="#599CFF" fontSize="15px" minWidth="120px">Space</Th>
                  <Th color="#599CFF" fontSize="15px">Item Size / Note</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr opacity="0.5">
                  <Td color="#8FA1FF" fontStyle="italic" fontWeight={600}>Discriminator</Td>
                  <Td color="#B84173" fontStyle="italic" fontWeight={600}>u8</Td>
                  <Td color="#8FA1FF" fontStyle="italic">
                    8
                  </Td>
                  <Td color="gray.600" fontWeight={600} fontStyle="italic">
                    Required by Default
                  </Td>
                </Tr>
                {Object.entries(spaceData).map(([field, { type, space, prefix_space }]) => (
                  <Tr key={field} bg={(type.startsWith("Vec<") || type == "String") ? "#1d1f37" : "transparent"}>
                    <Td color="#8FA1FF" fontWeight={600}>{field}</Td>
                    <Td color="#B84173" fontWeight={600}>{type}</Td>
                    <Td color="#8FA1FF" minWidth="120px">
                      {renderSpaceValue({ type, space, prefix_space })}
                    </Td>
                    {(type.startsWith("Vec<") || type == "String") ? <Td color="#8FA1FF">
                      <NumberInput>

                        <NumberInputField
                          border="1px solid"
                          borderColor="blue.500"
                          type="number"
                          padding="5px"
                          min="1"
                          placeholder="Enter amount"
                          onChange={(e) => handleAdditionalSpaceChange(space, e.target.value)}
                          borderBottomWidth="1px"
                          _hover={{ borderBottomWidth: "1px" }}
                        />
                      </NumberInput>

                    </Td> :
                      Object.keys(spaceReference).includes(type) ?
                        <Td color="gray.600" fontWeight={600} fontStyle="italic">
                          Not dynamic value
                        </Td> :

                        type.match(/^\[.*;.*\]$/) ?
                          <Td color="gray.500" fontWeight={600} fontStyle="italic">
                            {type.split(";")[0].slice(1)} ({spaceReference[type.split(";")[0].slice(1)]}) * {type.split(";")[1].replace("]", "")}
                          </Td>
                          :
                          <Td color="gray.500" fontWeight={600} fontStyle="italic">
                            Largest value from enum is picked
                          </Td>
                    }

                  </Tr>
                ))}
              </Tbody>

            </Table>
          </Box></>}

      </Flex>

    </>
  );
};

export default TableComponent;
