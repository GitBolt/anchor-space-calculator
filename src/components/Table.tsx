import { Table, Thead, Tbody, Tr, Th, Td, Input, useColorModeValue, Flex, Text, Divider, NumberInputField, NumberInput } from "@chakra-ui/react";
import { useState } from "react";

const TableComponent = ({ spaceData }) => {
  const [additionalSpace, setAdditionalSpace] = useState({});

  const handleAdditionalSpaceChange = (field, value) => {
    setAdditionalSpace((prevState) => ({
      ...prevState,
      [field]: Number(value),
    }));
  };

  const renderSpaceValue = ({ type, space, prefix_space }) => {
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
    Object.values(spaceData).forEach(({ space, prefix_space }) => {
      const additionalSpaceValue = additionalSpace[space] || 0;
      totalBytes += space + additionalSpaceValue + prefix_space;
    });
    return totalBytes;
  };


  return (
    <>
      <Flex bg="#0E0E17" w="100%" h="60vh" overflow="auto" flexFlow="column" p="10px 20px" rounded="10px">
        <Text fontSize="20px" color="#60569E">Space Required</Text>
        <Text fontSize="25px" color="white" fontWeight={800}>{calculateTotalSpace()}</Text>

        <Divider borderColor="gray.800" my='10px' />
        <Text fontSize="20px" color="#60569E">Total Byte Space</Text>
        <Text fontSize="25px" color="white" fontWeight={700}>{calculateTotalBytes()} Bytes</Text>

        <Divider borderColor="gray.800" my='10px' />
        <Text fontSize="20px" color="#60569E" mb="10px">Breakdown</Text>

        <Table bg="#161723" variant="simple" colorScheme="purple" rounded="10px">

          <Thead>
            <Tr>
              <Th color="#599CFF" fontSize="15px">Field</Th>
              <Th color="#599CFF" fontSize="15px">Type</Th>
              <Th color="#599CFF" fontSize="15px">Space</Th>
              <Th color="#599CFF" fontSize="15px">Item Size / Note</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr opacity="0.7">
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
              <Tr key={field}>
                <Td color="#8FA1FF" fontWeight={600}>{field}</Td>
                <Td color="#B84173" fontWeight={600}>{type}</Td>
                <Td color="#8FA1FF" minWidth="60px">
                  {renderSpaceValue({ type, space, prefix_space })}
                </Td>
                {(type.startsWith("Vec<") || type == "String") ? <Td color="#8FA1FF">
                  <NumberInput>

                    <NumberInputField
                      type="number"
                      padding="5px"
                      placeholder="Enter amount"
                      onChange={(e) => handleAdditionalSpaceChange(space, e.target.value)}
                      borderBottomWidth="1px"
                      _hover={{ borderBottomWidth: "1px" }}
                      borderColor="#1D1D2C"
                    />
                  </NumberInput>

                </Td> : <Td color="gray.600" fontWeight={600} fontStyle="italic">
                  Not dynamic value
                </Td>}
              </Tr>
            ))}
          </Tbody>

        </Table>
        {/* <Thead>
          <Tr>
            <Th color="#B84173" fontSize="1.2rem" textAlign="left">
              Space Required
            </Th>
            <Td color="#8FA1FF" textAlign="left">
              {calculateTotalSpace()}
            </Td>
          </Tr>
          <Tr>
            <Th color="#B84173" fontSize="1.2rem" textAlign="left">
              Sum of All Space
            </Th>
            <Td color="#8FA1FF" textAlign="left">
              {`${calculateTotalBytes()} bytes`}
            </Td>
          </Tr>
        </Thead> */}
      </Flex>

    </>
  );
};

export default TableComponent;
