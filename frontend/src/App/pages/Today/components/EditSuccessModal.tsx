import React from 'react'
import moment from 'moment'

import { Button, Modal, ButtonWrapper, LabelAndInput, Form, Paragraph } from 'sharedComponents'
import { TProject, TSuccess } from 'sharedTypes'
import database from 'database'
import { useLiveQuery } from 'dexie-react-hooks'
import { formatDateKeyLookup } from 'utilities'

type AddSuccessModalProps = {
    showModal: boolean
    setShowModal: (showModal: boolean) => void
    successId: TSuccess['id']
}

const AddSuccessModal = ({ showModal, setShowModal, successId }: AddSuccessModalProps) => {
    const [description, setDescription] = React.useState<string>('')
    const [projectId, setProjectId] = React.useState<TProject['id'] | ''>('')
    const [date, setDate] = React.useState<TProject['id'] | ''>('')
    const [isLoading, setIsLoading] = React.useState<boolean>(true)

    const projects = useLiveQuery(async () => {
        return database.projects.toArray()
    }, [])

    React.useEffect(() => {
        database
            .successes.where('id').equals(successId).first()
            .then((s: TSuccess) => {
                setDate(s.date)
                setDescription(s.description)
                setProjectId(s.projectId)
                setIsLoading(false)
            })
    }, [])

    const handleSubmit = () => {
        const editetSuccess = {
            description,
            id: successId,
            projectId,
            date: formatDateKeyLookup(moment(date))
        }
        database.successes.put(editetSuccess, [successId])
        setShowModal(false)
    }

    const projectSelectOptions = projects ? projects.map(({ id, title }) => ({ value: id, label: title })) : []
    projectSelectOptions.unshift({ value: '', label: 'Select a Project' })

    return (
        <Modal
            contentLabel="Add Success"
            showModal={showModal}
            closeModal={() => setShowModal(false)}
        >
            {
                isLoading
                    ? <Paragraph>One sec</Paragraph>
                    : (
                        <Form>
                            <LabelAndInput
                                label="Description"
                                name="description"
                                value={description}
                                handleChange={(value) => setDescription(value)}
                            />
                            <LabelAndInput
                                name="project"
                                value={projectId}
                                options={projectSelectOptions}
                                inputType="select-array"
                                label="Project (Optional)"
                                handleChange={(value) => setProjectId(value)}
                            />
                            <LabelAndInput
                                label="Date"
                                name="date"
                                value={moment(date).format('YYYY-MM-DD')}
                                inputType="date"
                                handleChange={(value) => setDate(value)}
                            />
                            <ButtonWrapper right={
                                [
                                    <Button
                                        key="cancel"
                                        variation="WARNING"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </Button>,
                                    <Button
                                        disabled={description.length === 0}
                                        key="save"
                                        variation="INTERACTION"
                                        onClick={handleSubmit}
                                    >
                                        Save
                                    </Button>
                                ]
                            }
                            />
                        </Form>
                    )
            }
        </Modal>
    )
}

export default AddSuccessModal
