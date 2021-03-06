import React from 'react'

import { Button, Heading, Table, DropdownMenu, BigBoxOfNothing, Icon } from 'sharedComponents'
import { TProject, TTask } from 'sharedTypes'
import { taskStatusLookup } from 'utilities'
import { EditTaskModal, EditProjectModal } from 'sharedModals'

type TasksTableProps = {
    tasks: TTask[]
    project: TProject
}

const TasksTable = ({ tasks, project }: TasksTableProps) => {
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
    const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)

    const TasksTableOnly = (
        <Table.Table>
            <Table.TableHeader>
                <Table.TableRow>
                    <Table.TableHeaderCell>Task</Table.TableHeaderCell>
                    <Table.TableHeaderCell width="200px">Status</Table.TableHeaderCell>
                    <Table.TableHeaderCell width="30px"></Table.TableHeaderCell>
                </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
                {tasks.map(({ title, status, id }) => (
                    <Table.TableRow key={id}>
                        <Table.TableBodyCell>{title}</Table.TableBodyCell>
                        <Table.TableBodyCell>{taskStatusLookup[status]}</Table.TableBodyCell>
                        <Table.TableBodyCell>
                            <Icon
                                key="edit"
                                name="edit"
                                onClick={() => setSelectedTaskId(id)}
                            />
                        </Table.TableBodyCell>
                    </Table.TableRow>
                ))}
            </Table.TableBody>
        </Table.Table>
    )

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'left' }}>
                <Heading.H3>{project.title}</Heading.H3> <Icon name="edit" onClick={() => setSelectedProjectId(project.id)}/>
            </div>
            {
                tasks.length === 0
                    ? (<BigBoxOfNothing message="Create a tasks and get going!" />)
                    : (TasksTableOnly)
            }

            {selectedTaskId
                ? (
                    <EditTaskModal
                        showModal={selectedTaskId !== null}
                        setShowModal={() => setSelectedTaskId(null)}
                        taskId={selectedTaskId}
                    />
                )
                : (null)
            }
            {selectedProjectId
                ? (
                    <EditProjectModal
                        showModal={selectedProjectId !== null}
                        setShowModal={() => setSelectedProjectId(null)}
                        projectId={selectedProjectId}
                    />
                )
                : (null)
            }
        </>
    )
}

export default TasksTable
