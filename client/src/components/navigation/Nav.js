import { useState } from 'react';
import {
  Heading,
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  FormLabel,
  FormControl,
  Spinner,
} from '@chakra-ui/react';
import './Nav.css';

const Nav = ({ handleSubmit, fetchError, showSpinner, handleDownload, browseMode }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);

  // test is URL (without https://) is valid https://regexr.com/3e6m0
  const isValidURL = (url) => {
    // eslint-disable-next-line no-useless-escape
    return /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi.test(url);
  }

  return (
    <div className="Nav">
      <Heading size="md">WebViewer HTML</Heading>
      <Text py={5}>
        In this demo, you can pass any URL. The URL passed in will be proxied
        and you will be able to annotate directly here.
      </Text>
      <FormControl id="domain" my={3}>
        <FormLabel>URL of the page</FormLabel>
        <InputGroup
          onChange={(e) => {
            setUrl(e.target.value);
          }}
        >
          <InputLeftAddon children="https://" />
          <Input placeholder="mysite" />
        </InputGroup>
      </FormControl>
      <FormControl>
        <Button
          my={3}
          onClick={() => {
            setError(false);
            if (!!url && isValidURL(url)) {
              handleSubmit(`https://${url}`);
            } else {
              setError(true);
            }
          }}
        >
          {showSpinner && <Spinner mx={1} label="Loading website" />}Load the website
        </Button>
        <Button my={3} onClick={() => handleDownload()}>
          {showSpinner && <Spinner mx={1} label="Loading website" />}Download annotated PDF
        </Button>
        <Button my={3} onClick={() => browseMode()}
        >
          {showSpinner && <Spinner mx={1} label="Loading website" />}Browse the website
        </Button>
      </FormControl>

      {error && (
        <Text color="red">
          Please enter a valid URL try again.
        </Text>
      )}
      {fetchError ? <Text color="red">{fetchError}</Text> : null}
    </div>
  );
};

export default Nav;
