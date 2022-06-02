import React, { useEffect, useState } from 'react';
import {
  Heading,
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
  const [error, setError] = useState('');

  // eslint-disable-next-line no-useless-escape
  const regexURL = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  const regexURLWithHttp = /^(http(s)?:\/\/.){1}/gi;

  useEffect(() => {
    setError(fetchError);
  }, [fetchError]);

  const setHTTPForURL = (url) => {
    if (regexURLWithHttp.test(url)) {
      return url;
    }
    return `https://${url}`;
  };

  // test is URL (without https://) is valid https://regexr.com/3e6m0
  const isValidURL = (url) => {
    if (url.startsWith('file:/')) {
      return false;
    }
    return regexURL.test(url);
  }

  const onSubmit = () => {
    if (!url || !isValidURL(url)) {
      setError('Please enter a valid URL and try again.');
      return;
    }

    handleSubmit(setHTTPForURL(url));
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
        <Input placeholder="https://www.pdftron.com/"
          onChange={(e) => {
            setError('');
            setUrl(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
      </FormControl>
      <FormControl>
        <Button
          my={3}
          disabled={showSpinner}
          onClick={onSubmit}
        >
          {showSpinner && <Spinner mx={1} label="Loading website" />}Load the website
        </Button>
        <Button my={3} onClick={() => browseMode()} disabled={showSpinner}>
          {showSpinner && <Spinner mx={1} label="Loading website" />}Browse the website
        </Button>
        <Button my={3} onClick={() => handleDownload()} disabled={showSpinner}>
          {showSpinner && <Spinner mx={1} label="Loading website" />}Download annotated PDF
        </Button>
      </FormControl>

      {error ? <Text color="red">{error}</Text> : null}
    </div>
  );
};

export default Nav;
