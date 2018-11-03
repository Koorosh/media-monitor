import * as React from "react"
import { observer } from 'mobx-react'
import { withStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CssBaseline from '@material-ui/core/CssBaseline'
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import red from "@material-ui/core/colors/red"
import AddIcon from "@material-ui/icons/Add"

import EditProjectForm from "./../components/edit-project-form"
import ProjectsList from "./../components/projects-list"
import { Project } from '../models'
import ProjectContext from '../contexts/project-context'
import ConfirmationDialog from '../components/confirmation-dialog'

enum OptionsMode {
  VIEW,
  EDIT
}

const styles = (theme: any) => ({
  root: {
    flexGrow: 1
  },
  card: {
    minWidth: 400,
    maxWidth: 800
  },
  actions: {
    display: "flex"
  },
  avatar: {
    backgroundColor: red[500]
  },
  checkbox: {
    width: 36,
    height: 36
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: "auto"
  }
})

interface OptionsState {
  isLoading: boolean
  isOpenConfirmationDialog: boolean
  mode: OptionsMode
  editProject: Project
  projectIdToRemove: string
}

@observer
class Options extends React.Component<any, OptionsState> {
  constructor(props: any) {
    super(props)

    this.state = {
      isOpenConfirmationDialog: false,
      isLoading: false,
      mode: OptionsMode.VIEW,
      editProject: undefined,
      projectIdToRemove: undefined
    }
  }

  onAddProjectClick = () => {
    this.setState({
      mode: OptionsMode.EDIT,
      editProject: undefined
    })
  }

  onNewProjectSubmit = (project: Project, isNew: boolean) => {
    this.setState({
      isLoading: true
    })

    const onSubmitted = () => {
      this.setState({
        mode: OptionsMode.VIEW,
        isLoading: false
      })
    }

    const onSubmittionFailed = (error: Error) => {
      onSubmitted()
      console.error(error)
    }

    if (isNew) {
      ProjectContext.createProject(project)
        .then(onSubmitted, onSubmittionFailed)
    }
    else {
      ProjectContext.updateProject(project)
        .then(onSubmitted, onSubmittionFailed)
    }
  }

  onNewProjectFormClose = () => {
    this.setState({
      mode: OptionsMode.VIEW,
      editProject: undefined
    })
  }

  onProjectRemove = (projectId: string) => {
    this.setState({
      projectIdToRemove: projectId,
      isOpenConfirmationDialog: true
    })
  }

  onProjectRemoveConfirmed() {
    if (!this.state.projectIdToRemove) return
    const project = ProjectContext.projects.find(p => p.id === this.state.projectIdToRemove)
    ProjectContext.removeProject(project)
    this.setState({
      projectIdToRemove: undefined,
      isOpenConfirmationDialog: false
    })
  }

  onProjectRemoveCancelled() {
    this.setState({
      projectIdToRemove: undefined,
      isOpenConfirmationDialog: false
    })
  }

  onProjectEdit = (projectId: string) => {
    this.setState({
      mode: OptionsMode.EDIT,
      editProject: ProjectContext.projects.find(project => project.id === projectId)
    })
  }

  onProjectSetActive = (projectId: string) => {
    ProjectContext.setActiveProject(projectId)
  }

  render() {
    const { classes } = this.props
    const { mode, editProject, isLoading, isOpenConfirmationDialog } = this.state
    return (
      <React.Fragment>
        <CssBaseline />
        <ConfirmationDialog
          open={isOpenConfirmationDialog}
          message={'Ви дійсно хочете видалити проект?'}
          title={'Підтведження'}
          onSubmit={() => this.onProjectRemoveConfirmed()}
          onCancel={() => this.onProjectRemoveCancelled()}
        />
        <Card className={classes.card}>
          {
            mode === OptionsMode.VIEW && (
              <React.Fragment>
                <CardContent>
                  <ProjectsList
                    items={ProjectContext.projects}
                    onEdit={projectId => this.onProjectEdit(projectId)}
                    onRemove={projectId => this.onProjectRemove(projectId)}
                    onSetActive={projectId => this.onProjectSetActive(projectId)}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    onClick={this.onAddProjectClick}
                    variant="fab"
                    mini
                    color="primary"
                    aria-label="Add"
                    className={classes.button}
                  >
                    <AddIcon />
                  </Button>
                </CardActions>
              </React.Fragment>
            )
          }
          {
            mode === OptionsMode.EDIT && (
              <EditProjectForm
                isLoading={isLoading}
                initProject={editProject}
                onSubmit={(project: Project) => this.onNewProjectSubmit(project, !editProject)}
                onClose={() => this.onNewProjectFormClose()}
              />
            )
          }
        </Card>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Options)
