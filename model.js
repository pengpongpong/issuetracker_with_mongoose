const mongoose = require("mongoose")
const { Schema } = mongoose;

const IssueSchema = new Schema({
    issue_title: {type: String},
    issue_text: {type: String},
    created_by: {type: String},
    assigned_to: {type: String, required: false},
    open: {type: Boolean, default: true},
    status_text: {type: String, required: false},
    created_on: {type: Date},
    updated_on: {type: Date}
  });
  
  const Issue = mongoose.model("Issue", IssueSchema);

  const ProjectSchema = new Schema({
    name: {type: String, required: true},
    issues: [IssueSchema]
  });

  const Project = mongoose.model("Project", ProjectSchema);

  exports.Issue = Issue;
  exports.Project = Project;