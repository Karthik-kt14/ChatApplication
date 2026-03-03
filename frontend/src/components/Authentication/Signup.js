
import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setPicLoading(true);

    if (!pics) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dnzzmgb2m");

      fetch("https://api.cloudinary.com/v1_1/dnzzmgb2m/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.secure_url);
          setPicLoading(false);
        })
        .catch(() => {
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Invalid image format",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  const submitHandler = async () => {
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please fill all fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setPicLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
       // "http://localhost:5000/api/user",
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred",
        description:
          error.response?.data?.message || "Server not reachable",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input onChange={(e) => setName(e.target.value)} />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input type="email" onChange={(e) => setEmail(e.target.value)} />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement>
            <Button size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <Input
          type={show ? "text" : "password"}
          onChange={(e) => setConfirmpassword(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Upload Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        color="white"
        mt={3}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;

//  try {
//     const response = await fetch("http://localhost:5000/api/user", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name,
//         email,
//         password,
//         pic,
//       }),
//     });

//     const data = await response.json();

//     toast({
//       title: "Registration Successful",
//       status: "success",
//       duration: 5000,
//       isClosable: true,
//       position: "bottom",
//     });

//     localStorage.setItem("userInfo", JSON.stringify(data));
//     setPicLoading(false);
//   } catch (error) {
//     toast({
//       title: "Error Occurred",
//       description: error.message,
//       status: "error",
//       duration: 5000,
//       isClosable: true,
//       position: "bottom",
//     });
//     setPicLoading(false);
//   }