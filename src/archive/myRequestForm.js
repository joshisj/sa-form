import React from 'react';
import { Storage } from 'aws-amplify'
import { v4 as uuidv4 } from 'uuid';
import { Form, Header, Segment } from 'semantic-ui-react';

import { API, graphqlOperation } from "aws-amplify";
import * as mutations from './graphql/mutations';


import {
  AutoField,
  AutoForm,
  ErrorsField,
  DateField,
  RadioField,
  SubmitField
} from 'uniforms-semantic';

import RequestSchema from './SaRequestSchema';

const style = {
  margin: 200,
};

// Get the query parameters and default them into the form
let search = window.location.search;
let params = new URLSearchParams(search);
// Salesforce account data passed into this script
let link = params.get('link');
let name = params.get('name');
let opportunity = params.get('opportunity');
console.log(name);

var handleAdd = (doc) => {

  // generate unique request# and file name for S3
  var requestID = uuidv4();
  var s3fileName = 'sa-requests/request-' + requestID + '.json' 
  console.log('Request ID:', requestID)
  console.log('File Name:', s3fileName);

  console.log("Here is the document",doc)
  //api.posts.createPost({ post: post}).then(json => displayMessage(json))

  // save the form data to S3 cloud Storage
  var addToStorage = () => {
    Storage.put(s3fileName, doc)
      .then (result => {
        console.log('result: ', result)
      })
      .catch(err => console.log('error: ', err));
  }
  addToStorage();

  //write data to the API using Graphql
  (async () => {
    const newRequest = await API.graphql(graphqlOperation(mutations.createRequest, {input: doc}));
  })();
}

export default function RequestForm() {

  return (
    <form>
    <AutoForm style={style} schema={RequestSchema} onSubmit={doc => handleAdd(doc)}>
      <h2>SA Activity/Support Request</h2>
      <Form.Group widths="equal">
        <AutoField name="accountLink" />
        <AutoField name="accountName" />
        <AutoField name="accountOpportunity" />
      </Form.Group>
      <h3>Activity Details</h3>
      <Form.Group widths="equal">
        <AutoField name="activityTitle" />
        <AutoField name="activityType" />
      </Form.Group>
      <Form.Group widths="equal">
        <AutoField name="activityTopic" />
        <AutoField name="activityDomain" />
        <AutoField name="activityComplexity" /> 
      </Form.Group>    
      <AutoField name="activityDetails" />
      <Form.Group widths="equal">
        <DateField name="activityFromDate" />
        <DateField name="activityToDate" />
      </Form.Group>
      <AutoField name="activityLocation" />    
      <RadioField name="activityInteractionType" />
      <SubmitField value='Submit Request'/>
      <ErrorsField />
    </AutoForm>
    </form>
  );
}