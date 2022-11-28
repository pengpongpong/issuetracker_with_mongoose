const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { AssertionError } = require('chai');
const path = "/api/issues/apitest" //fill project

chai.use(chaiHttp);
let id;
let created_on;
let updated_on;

suite('Functional Tests', function() {

  // POST REQUEST
  suite("post request", () => {
    test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post(path)
        .set("content-type", "application/json")
        .send({
            issue_title: "test_title",
            issue_text: "test_text",
            created_by: "tester",
            assigned_to: "test",
            status_text: "test_status"
        })
        .end((err, res) => {
            id = res.body._id
            created_on = res.body.created_on
            updated_on = res.body.updated_on
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.equal(res.body.issue_title, "test_title");
            assert.equal(res.body.issue_text, "test_text");
            assert.equal(res.body.created_by, "tester");
            assert.equal(res.body.assigned_to, "test");
            assert.equal(res.body.status_text, "test_status");
            done();
        });   
    });
    test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
      chai 
        .request(server)
        .post(path)
        .set("content-type", "application/json")
        .send({
          issue_title: "required_title",
          issue_text: "required_text",
          created_by: "required_creator"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.issue_title, "required_title");
          assert.equal(res.body.created_by, "required_creator");
          done();
        })
    });
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .post(path)
        .set("content-type", "application/json")
        .send({
          issue_text: "test",
          created_by: "test"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "required field(s) missing")
          done();
        })
    });
  });


  // GET REQUEST
  suite("get request", () => {
    test("View issues on a project: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(path)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body)
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "_id");
          done();
        })
    });
    test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(path)
        .query({
          _id: id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body);
          // assert.equal(res.body[0].issue_title, "test_title");
          // assert.equal(res.body[0].issue_text, "test_text");
          // assert.equal(res.body[0].created_by, "tester");
          // assert.equal(res.body[0].assigned_to, "test");
          // assert.equal(res.body[0].status_text, "test_status");
          assert.deepEqual(res.body[0], {
            issue_title: "test_title",
            issue_text: "test_text",
            created_by: "tester",
            assigned_to: "test",
            open: true,
            status_text: "test_status",
            created_on: created_on,
            updated_on: updated_on,
            _id: id
          })
          done();
        })

    });
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .get(path)
        .query({
          _id: id,
          issue_title: "test_title",
          issue_text: "test_text"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body);
          assert.include(res.body[0], {
            issue_title: "test_title",
            issue_text: "test_text",
            created_by: "tester",
            assigned_to: "test",
            open: true,
            status_text: "test_status",
            created_on: created_on,
            updated_on: updated_on,
            _id: id
          })
          done();
        })

    });
  });


  // PUT REQUEST
  suite("put request", () => {
    test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(path)
        .send({
          _id: "63841824f8a0442b26ba8b9c",
          issue_title: "new test"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "63841824f8a0442b26ba8b9c");
          done();
        })
    });
    test("Update multiple fields on an issue: PUT request to /api/issues/{project", (done) => {
      chai
        .request(server)
        .put(path)
        .send({
          _id: "63841824f8a0442b26ba8b9c",
          issue_title: "another test",
          issue_text: "new text"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "63841824f8a0442b26ba8b9c");
          done();
        })

    });
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(path)
        .send({
          issue_title: "missing _id"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "missing _id");
          done();
        })

    });
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(path)
        .send({
          _id: "63841824f8a0442b26ba8b9c"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        })

    });
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .put(path)
        .send({
          _id: "invalid",
          issue_title: "invalid"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "could not update");
          done();
        })

    });
  });

  // DELETE REQUEST
  suite("delete request", () => {
    test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete(path)
        .send({
          _id: id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.result, "successfully deleted");
          done();
        })



    });
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete(path)
        .send({
          _id: "invalid"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "could not delete");
          done();
        })

    });
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
      chai
        .request(server)
        .delete(path)
        .send({
          _id: undefined
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.error, "missing _id");
          done();
        })
    });
  });
});
