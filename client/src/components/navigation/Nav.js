import React, { useEffect, useState } from 'react';
import {
  Heading,
  InputGroup,
  Input,
  Checkbox,
  Button,
  Text,
  FormLabel,
  FormControl,
  Spinner,
} from '@chakra-ui/react';
import './Nav.css';

const Nav = ({ handleSubmit, fetchError, showSpinner, handleDownload, browseMode, handleScrolling }) => {
  const [url, setUrl] = useState('');
  const [urlWithHttp, setUrlWithHttp] = useState('');
  const [error, setError] = useState('');

  // eslint-disable-next-line no-useless-escape
  const regexURL = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  const regexURLWithHttp = /^(http(s)?:\/\/.){1}/gi;

  useEffect(() => {
    setError(fetchError);
  }, [fetchError]);

  useEffect(() => {
    if (regexURLWithHttp.test(url)) {
      setUrlWithHttp(url);
    } else {
      setUrlWithHttp(`https://${url}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // test is URL (without https://) is valid https://regexr.com/3e6m0
  const isValidURL = (url) => {
    return regexURL.test(url);
  }

  return (
    <div className="Nav">
      <Heading size="md">WebViewer HTML</Heading>
      <Text py={5}>
        In this demo, you can pass any URL. The URL passed in will be proxied
        and you will be able to annotate directly here.
        <br />
        For best results, please copy and paste the URL.
      </Text>
      <FormControl id="domain" my={3}>
        <FormLabel>URL of the page</FormLabel>
        <InputGroup
          onChange={(e) => {
            setError('');
            setUrl(e.target.value);
          }}
        >
          <Input placeholder="https://www.pdftron.com/" />
        </InputGroup>
      </FormControl>
      <FormControl>
        <Button
          my={3}
          disabled={showSpinner}
          onClick={() => {
            if (!!url && isValidURL(url)) {
              handleSubmit(urlWithHttp);
            } else {
              setError('Please enter a valid URL and try again.');
            }
          }}
        >
          {showSpinner && <Spinner mx={1} label="Loading website" />}Load the website
        </Button>
        <Button my={3} onClick={() => browseMode()} disabled={showSpinner}>
          {showSpinner && <Spinner mx={1} label="Loading website" />}Browse the website
        </Button>
        <Button my={3} onClick={() => handleDownload()} disabled={showSpinner}>
          {showSpinner && <Spinner mx={1} label="Loading website" />}Download annotated PDF
        </Button>

        <Checkbox my={3} onChange={(e) => handleScrolling(e.target.checked)}>
          Scroll website
        </Checkbox>
      </FormControl>

      {error ? <Text color="red">{error}</Text> : null}
    </div>
  );
};

export default Nav;
