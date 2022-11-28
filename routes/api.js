'use strict';
const mongoose = require("mongoose");
const IssueModel = require("../model").Issue;
const ProjectModel = require("../model").Project;
const ObjectId = mongoose.Types.ObjectId;


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project
      const { _id, open, assigned_to, created_by, created_on, updated_on, issue_title, issue_text, status_text } = req.query
        
      ProjectModel.aggregate([
        { $match: {name: project} },
        { $unwind: "$issues" },
        _id != undefined
          ? { $match: {"issues._id": ObjectId(_id)} }
          : { $match: {} },
        open != undefined
          ? { $match: {"issues.open": open } }
          : { $match: {} },
        assigned_to != undefined
          ? { $match: {"issues.assigned_to": assigned_to } }
          : { $match: {} },
        created_by != undefined
          ? { $match: {"issues.created_by": created_by } }
          : { $match: {} },
        created_on != undefined
          ? { $match: {"issues.created_on": created_on } }
          : { $match: {} },
        updated_on != undefined
          ? { $match: {"issues.updated_on": updated_on } }
          : { $match: {} },
        issue_title != undefined
          ? { $match: {"issues.issue_title": issue_title } }
          : { $match: {} },
        issue_text != undefined
          ? { $match: {"issues.issue_text": issue_text } }
          : { $match: {} },
        status_text != undefined
          ? { $match: {"issues.status_text": status_text } }
          : { $match: {} },
      ]).exec((err, data) => {
        if (err) throw new Error(err);
        let mappedData = data.map(data => data.issues)
        res.json(mappedData)
      })
    })

    .post(function (req, res){
      const project = req.params.project
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      
  
      if (!issue_title || !issue_text || !created_by) {
        res.json({
          error: "required field(s) missing"
        })
      }
      else {
        
        const issue = new IssueModel({
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          created_on: new Date(),
          updated_on: new Date()
        });
        
        ProjectModel.findOne({name: project}, (err, projectData) => {
          if (!projectData) {
            const newProject = new ProjectModel({
              name: project
            });
            newProject.issues.push(issue);
            newProject.save((err, data) => {
              res.json(issue)
            })
          }
          else {
            projectData.issues.push(issue);
            projectData.save((err, data) => {
              res.json(issue)
            })
          }
        })
      };
    })
    
    .put(function (req, res){
      const project = req.params.project
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body

      if (!_id) {
        res.json({
          error: "missing _id"
        });
        return;
      };
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.json({
          error: "no update field(s) sent",
          _id: _id
        })
        return;
      }
      
      ProjectModel.findOne({name: project}, (err, projectData) => {
        if (err || !projectData) {
          res.json({
            error: "could not update",
            _id: _id
          })
        }
        else {
          const issueData = projectData.issues.id(_id)
          if (!issueData) {
            res.json({
              error: "could not update",
              _id: _id
            })
            return;
          }

          if(issue_title){
            issueData.issue_title = issue_title
          };
          if(issue_text){
            issueData.issue_text = issue_text
          };
          if(created_by){
            issueData.created_by = created_by 
          };
          if(assigned_to){
            issueData.assigned_to = assigned_to
          };
          if(status_text){
            issueData.status_text = status_text 
          };
          if(open){
            issueData.open = open
          };
          issueData.updated_on = new Date();

          projectData.save((err, data) => {
            if (err || !data) {
              res.json({
                error: "could not update",
                _id: _id
              })
            }
            else {
              res.json({
                result: "successfully updated",
                _id: _id
              })
            }
          })

        }
      });
    })
    
    .delete(function (req, res){
      const project = req.params.project
      const { _id } = req.body
      if (!_id) {
        res.json({
          error: "missing _id"
        })
        return;
      }
      ProjectModel.findOne({name: project}, (err, projectData) => {
        if (err || !projectData) {
          res.json({
            error: "could not delete",
            _id: _id   
          })
        }
        else {
          const issueData = projectData.issues.id(_id);
          if (!issueData) {
            res.json({
              error: "could not delete",
              _id: _id
            })
            return;
          }
          issueData.remove()

          projectData.save((err, data) => {
            if (err || !data) {
              res.json({
                error: "could not delete",
                _id: issueData._id
              })
            }
            else {
              res.json({
                result: "successfully deleted",
                _id: issueData._id
              })
            }
          })
        }
      });     
    });   
};
