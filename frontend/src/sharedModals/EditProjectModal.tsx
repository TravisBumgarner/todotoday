import React from 'react'
import moment, { Moment } from 'moment'
import { useLiveQuery } from 'dexie-react-hooks'

import { Button, Modal, ButtonWrapper, LabelAndInput, Form, Paragraph } from 'sharedComponents'
import { TProject, EProjectStatus } from 'sharedTypes'
import { formatDateKeyLookup, projectStatusLookup } from 'utilities'
import database from 'database'

type EditProjectModalProps = {
    projectId: TProject['id']
    showModal: boolean
    setShowModal: (showModal: boolean) => void
}

const EditProjectModal = ({ showModal, setShowModal, projectId }: EditProjectModalProps) => {
    const [title, setTitle] = React.useState<string>('')
    const [startDate, setStartDate] = React.useState<Moment | null>(null)
    const [endDate, setEndDate] = React.useState<Moment | null>(null)
    const [status, setStatus] = React.useState<EProjectStatus>(EProjectStatus.NEW)
    const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(true)
    const [isLoading, setIsLoading] = React.useState<boolean>(true)

    React.useEffect(() => {
        database
            .projects.where('id').equals(projectId).first()
            .then(project => {
                const {title, startDate, endDate, status} = project as TProject
                setTitle(title)
                setStartDate(startDate ? moment(startDate) : null)
                setEndDate(endDate ? moment(endDate) : null)
                setStatus(status)
                setIsLoading(false)
            })
    }, [])

    const handleSubmit = () => {
        const editedProject = {
            title,
            startDate: startDate ? formatDateKeyLookup(startDate) : null,
            endDate: endDate ? formatDateKeyLookup(endDate) : null,
            status,
            id: projectId
        }
        database.projects.put(editedProject, [projectId])
        setShowModal(false)
    }

    return (
        <Modal
            contentLabel="Edit Project"
            showModal={showModal}
            closeModal={() => setShowModal(false)}
        >
            {
                isLoading
                    ? <Paragraph>One sec</Paragraph>
                    : (
                        <Form onChange={() => setSubmitDisabled(false)}>
                            <LabelAndInput
                                label="Title"
                                name="title"
                                value={title}
                                handleChange={(data) => setTitle(data)}
                            />
                            <LabelAndInput
                                label="Start Date (Optional)"
                                name="startDate"
                                value={startDate ? startDate.format('YYYY-MM-DD') : ''}
                                inputType="date"
                                handleChange={(date) => setStartDate(moment(date))}
                            />
                            <LabelAndInput
                                label="End Date (Optional)"
                                name="endDate"
                                value={endDate ? endDate.format('YYYY-MM-DD') : ''}
                                inputType="date"
                                handleChange={(date) => setEndDate(moment(date))}
                            />
                            <LabelAndInput
                                label="Status"
                                name="status"
                                value={status}
                                options={EProjectStatus}
                                optionLabels={projectStatusLookup}
                                inputType="select-enum"
                                handleChange={(newStatus: EProjectStatus) => setStatus(newStatus)}
                            />
                            <ButtonWrapper right={
                                [
                                    <Button key="cancel" variation="INTERACTION" onClick={() => setShowModal(false)}>Cancel</Button>,
                                    <Button key="save" disabled={submitDisabled} variation="WARNING" onClick={handleSubmit}>Save</Button>
                                ]
                            }
                            />
                        </Form>
                    )
            }


        </Modal>
    )
}

export default EditProjectModal