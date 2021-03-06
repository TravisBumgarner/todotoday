import React from 'react'
import moment, { Moment } from 'moment'

import database from 'database'
import { EColorTheme, EDateFormat, EDaysOfWeek, EBackupInterval, TReminder } from 'sharedTypes'
import {
    Paragraph,
    ConfirmationModal,
    Heading,
    LabelAndInput,
    Form,
    Modal,
    BigBoxOfNothing,
    Button,
    ButtonWrapper,
    Table,
    DropdownMenu,
    LabelInDisguise,
    PageHeader,
    SmallParagraph,
    Icon
} from 'sharedComponents'
import {
    dateFormatLookup,
    formatDurationDisplayString,
    dayOfWeekLabels,
    colorThemeOptionLabels,
    backupIntervalLookup,
    saveFile,
    getLocalStorage,
    setLocalStorage
} from 'utilities'
import { context } from 'Context'
import { AddReminderIPC, EditReminderIPC, BackupIPC } from '../../../../shared/types'

const { ipcRenderer } = window.require('electron')

const createBackup = async () => {
    const data = {
        projects: await database.projects.toArray(),
        tasks: await database.tasks.toArray(),
        todoListItems: await database.todoListItems.toArray(),
        successes: await database.successes.toArray(),
    }
    return data
}

const MINUTE_IN_MS = 1000 * 60
const backupIntervalToMilliseconds = {
    [EBackupInterval.MINUTELY]: MINUTE_IN_MS,
    [EBackupInterval.HOURLY]: MINUTE_IN_MS * 60,
    [EBackupInterval.DAILY]: MINUTE_IN_MS * 60 * 24,
    [EBackupInterval.WEEKLY]: MINUTE_IN_MS * 60 * 24 * 7,
    [EBackupInterval.MONTHLY]: MINUTE_IN_MS * 60 * 24 * 30,
} as const

const runAutomatedBackup = (showAutomatedBackupFailedModal: React.Dispatch<React.SetStateAction<boolean>>) => {
    createBackup().then(async (data) => {
        const response = await ipcRenderer.invoke(
            'backup',
            { filename: `${moment().toISOString()}.json`, data: JSON.stringify(data) } as BackupIPC
        )
        if (response.isSuccess === true) {
            setLocalStorage('lastBackup', moment().toString())
        } else {
            showAutomatedBackupFailedModal(true)
        }
    })
}

const createNewBackupInterval = (
    showAutomatedBackupFailedModal: React.Dispatch<React.SetStateAction<boolean>>,
    backupIntervalInMilliseconds: number
) => {
    clearInterval(window.automatedBackupIntervalId)
    window.automatedBackupIntervalId = setInterval(() => {
        runAutomatedBackup(showAutomatedBackupFailedModal)
    }, backupIntervalInMilliseconds)
}

const setupAutomatedBackup = (showAutomatedBackupFailedModal: React.Dispatch<React.SetStateAction<boolean>>) => {
    const backupInterval = getLocalStorage('backupInterval') as EBackupInterval
    if (backupInterval === EBackupInterval.OFF) {
        return
    }
    const lastBackup = getLocalStorage('lastBackup')

    const lastBackupThreshold = moment()
    lastBackupThreshold.subtract(backupIntervalToMilliseconds[backupInterval], 'milliseconds')

    if (!lastBackup || moment(lastBackup) < lastBackupThreshold) {
        runAutomatedBackup(showAutomatedBackupFailedModal)
    }
    createNewBackupInterval(showAutomatedBackupFailedModal, backupIntervalToMilliseconds[backupInterval])
}

const dateFormatForUser = (format: EDateFormat, date: Moment) => {
    return {
        [EDateFormat.A]: `${moment(date).format(dateFormatLookup[EDateFormat.A])} `,
        [EDateFormat.B]: `${moment(date).format((dateFormatLookup[EDateFormat.B]))}`,
        [EDateFormat.C]: `${moment(date).format((dateFormatLookup[EDateFormat.C]))} (Month/Day/Year)`,
        [EDateFormat.D]: `${moment(date).format((dateFormatLookup[EDateFormat.D]))} (Day/Month/Year)`,
    }[format]
}

const dateFormatOptionLabels: Record<EDateFormat, string> = {
    [EDateFormat.A]: dateFormatForUser(EDateFormat.A, moment()),
    [EDateFormat.B]: dateFormatForUser(EDateFormat.B, moment()),
    [EDateFormat.C]: dateFormatForUser(EDateFormat.C, moment()),
    [EDateFormat.D]: dateFormatForUser(EDateFormat.D, moment()),
}

type AddEditReminderModalProps = {
    showModal: boolean
    setShowModal: (showModal: boolean) => void
    reminderToEdit?: TReminder
}

const AddEditReminderModal = ({ showModal, setShowModal, reminderToEdit }: AddEditReminderModalProps) => {
    const [dayOfWeek, setDayOfWeek] = React.useState<EDaysOfWeek>(reminderToEdit ? reminderToEdit.dayOfWeek : EDaysOfWeek.MONDAY)
    const [timeOfDay, setTimeOfDay] = React.useState<any>(reminderToEdit
        ? formatDurationDisplayString(parseInt(reminderToEdit.hours, 10) * 60 + parseInt(reminderToEdit.minutes, 10))
        : '17:00')
    const { dispatch } = React.useContext(context)

    const handleAdd = async () => {
        const [hours, minutes] = timeOfDay.split(':')
        const payload = { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10), dayOfWeek: parseInt(dayOfWeek, 10) } as AddReminderIPC
        const reminderIndex = await ipcRenderer.invoke('add-reminder', payload)

        dispatch({ type: 'ADD_REMINDER', payload: { dayOfWeek, hours, minutes, reminderIndex } })
        setShowModal(false)
    }

    const handleEdit = async () => {
        const [hours, minutes] = timeOfDay.split(':')
        const payload = {
            reminderIndex: reminderToEdit!.reminderIndex,
            hours: parseInt(hours, 10),
            minutes: parseInt(minutes, 10),
            dayOfWeek: parseInt(dayOfWeek, 10)
        } as EditReminderIPC
        await ipcRenderer.invoke('edit-reminder', payload)

        dispatch({ type: 'EDIT_REMINDER', payload: { dayOfWeek, hours, minutes, reminderIndex: reminderToEdit!.reminderIndex } })
        setShowModal(false)
    }

    return (
        <Modal
            contentLabel="Add Reminder"
            showModal={showModal}
            closeModal={() => setShowModal(false)}
        >
            <Form>
                <LabelAndInput
                    label="Day"
                    name="dayOfWeek"
                    value={dayOfWeek}
                    inputType="select-enum"
                    options={EDaysOfWeek}
                    optionLabels={dayOfWeekLabels}
                    handleChange={(value: EDaysOfWeek) => setDayOfWeek(value)}
                />
                <LabelAndInput
                    label="Time"
                    name="timeOfDay"
                    value={timeOfDay}
                    inputType="time"
                    handleChange={(value: unknown) => setTimeOfDay(value)}
                />
                <ButtonWrapper right={
                    [
                        <Button type="button" key="cancel" variation="WARNING" onClick={() => setShowModal(false)}>Cancel</Button>,
                        <Button type="button" key="save" variation="INTERACTION" onClick={reminderToEdit ? handleEdit : handleAdd}>Save</Button>
                    ]
                }
                />
            </Form>
        </Modal>
    )
}

const RemindersTable = () => {
    const { state, dispatch } = React.useContext(context)
    const [selectedReminderIndex, setSelectedReminderIndex] = React.useState<string | null>()

    const handleDelete = async (reminderIndex: string) => {
        const deletedReminderIndex = await ipcRenderer.invoke('remove-reminder', reminderIndex)

        dispatch({ type: 'DELETE_REMINDER', payload: { deletedReminderIndex } })
    }

    return (
        <Table.Table>
            <Table.TableHeader>
                <Table.TableRow>
                    <Table.TableHeaderCell>Day Of Week</Table.TableHeaderCell>
                    <Table.TableHeaderCell>Time of Day</Table.TableHeaderCell>
                    <Table.TableHeaderCell width="100px">Actions</Table.TableHeaderCell>
                </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
                {state.reminders
                    .sort((a, b) => {
                        // Sort in one go. Might be a better way :shrug:
                        const aString = `${a.dayOfWeek} ${formatDurationDisplayString(parseInt(a.hours, 10) * 60 + parseInt(a.minutes, 10))}`
                        const bString = `${b.dayOfWeek} ${formatDurationDisplayString(parseInt(b.hours, 10) * 60 + parseInt(b.minutes, 10))}`
                        if (aString < bString) return -1
                        if (aString > bString) return 1
                        return 0
                    })
                    .map(({ dayOfWeek, minutes, hours, reminderIndex }) => (
                        <Table.TableRow key={reminderIndex}>
                            <Table.TableBodyCell>{dayOfWeekLabels[dayOfWeek]}</Table.TableBodyCell>
                            <Table.TableBodyCell>{formatDurationDisplayString(parseInt(hours, 10) * 60 + parseInt(minutes, 10))}</Table.TableBodyCell>
                            <Table.TableBodyCell>
                                <Icon
                                    key="edit"
                                    name="edit"
                                    onClick={() => setSelectedReminderIndex(reminderIndex)}
                                />
                                <Icon
                                    key="remove"
                                    name="delete"
                                    onClick={() => handleDelete(reminderIndex)}
                                />
                            </Table.TableBodyCell>
                        </Table.TableRow>
                    ))}
            </Table.TableBody>
            {
                selectedReminderIndex
                    ? (
                        <AddEditReminderModal
                            reminderToEdit={state.reminders.find(({ reminderIndex }) => reminderIndex === selectedReminderIndex)}
                            setShowModal={() => setSelectedReminderIndex(null)}
                            showModal={selectedReminderIndex !== null}
                        />
                    ) : null
            }
        </Table.Table>
    )
}

const Settings = () => {
    const { state, dispatch } = React.useContext(context)
    const [showAddReminderModal, setShowAddReminderModal] = React.useState<boolean>(false)
    const [restore, setRestore] = React.useState<File | null>(null)
    const [showRestoreConfirmModal, setShowRestoreConfirmModal] = React.useState<boolean>(false)
    const [showNoDataModal, setShowNoDataModal] = React.useState<boolean>(false)
    const [showInvalidBackupModal, setShowInvalidBackupModal] = React.useState<boolean>(false)

    const handleBackup = async () => {
        const data = await createBackup()
        if (!data) {
            setShowNoDataModal(true)
        } else {
            saveFile(`${moment().toISOString()}.json`, data)
        }
    }

    const handleRestore = () => {
        if (restore) {
            const reader = new FileReader()
            reader.readAsText(restore, 'UTF-8')
            reader.onload = async function (event) {
                if (event.target && event.target.result) {
                    const newStore = JSON.parse(event.target.result as string)

                    await Promise.all([
                        database.projects.clear(),
                        database.tasks.clear(),
                        database.todoListItems.clear(),
                        database.successes.clear()
                    ])

                    await Promise.all([
                        database.projects.bulkAdd(newStore.projects),
                        database.tasks.bulkAdd(newStore.tasks),
                        database.todoListItems.bulkAdd(newStore.todoListItems),
                        database.successes.bulkAdd(newStore.successes)
                    ])
                    setRestore(null)
                } else {
                    setShowInvalidBackupModal(true)
                }
            }
        }
        setShowRestoreConfirmModal(false)
    }

    const handleSubmit = ({ key, value }: { key: string, value: string }) => {
        dispatch({ type: 'EDIT_USER_SETTING', payload: { key, value } })
    }
    return (
        <div>
            <PageHeader>
                <Heading.H2>
                    Settings
                </Heading.H2>
            </PageHeader>
            <Heading.H3>User Preferences</Heading.H3>
            <Form>
                <LabelAndInput
                    inputType="select-enum"
                    name="dateFormat"
                    label="Preferred Date Format"
                    value={state.dateFormat}
                    handleChange={(value: EDateFormat) => handleSubmit({ key: 'dateFormat', value })}
                    options={EDateFormat}
                    optionLabels={dateFormatOptionLabels}
                />
                <LabelAndInput
                    inputType="select-enum"
                    name="colorTheme"
                    label="Theme"
                    value={state.colorTheme}
                    handleChange={(value: EColorTheme) => handleSubmit({ key: 'colorTheme', value })}
                    options={EColorTheme}
                    optionLabels={colorThemeOptionLabels}
                />
            </Form>
            <div style={{ marginTop: '2rem' }}>
                <LabelInDisguise>Schedule Reminders</LabelInDisguise>
                {state.reminders.length === 0
                    ? <BigBoxOfNothing message="No Reminders yet, click Add Reminder Below" />
                    : <RemindersTable />}
                <Button
                    type="button"
                    key="addSchedule"
                    fullWidth
                    onClick={() => setShowAddReminderModal(true)}
                    variation="INTERACTION"
                >
                    Add Reminder
                </Button>
            </div>
            {
                showAddReminderModal
                    ? <AddEditReminderModal setShowModal={setShowAddReminderModal} showModal={showAddReminderModal} />
                    : null
            }
            <div>
                <Heading.H3>Backups</Heading.H3>
                <ButtonWrapper
                    fullWidth={
                        <Button type="button" onClick={() => handleBackup()} fullWidth variation="INTERACTION">Create Backup</Button>
                    }
                />
                <LabelAndInput
                    inputType="select-enum"
                    name="weekStart"
                    label="Would you like to automate backups?"
                    value={state.backupInterval}
                    handleChange={(value: EBackupInterval) => dispatch({ type: 'EDIT_USER_SETTING', payload: { key: 'backupInterval', value } })}
                    options={EBackupInterval}
                    optionLabels={backupIntervalLookup}
                />
                <SmallParagraph>Last Backup: {getLocalStorage('lastBackup')}</SmallParagraph>
                <SmallParagraph>Backup Location: {state.backupDir}</SmallParagraph>

                <Heading.H3>Restore</Heading.H3>
                <Form>
                    <LabelAndInput
                        handleChange={(file) => setRestore(file)}
                        label="Restore database with a backup copy."
                        name="file"
                        inputType="file"
                    />
                    <ButtonWrapper
                        fullWidth={(
                            <Button
                                disabled={!restore}
                                onClick={() => setShowRestoreConfirmModal(true)}
                                fullWidth
                                variation="INTERACTION"
                                type="button"
                            >
                                Restore from Backup
                            </Button>
                        )}
                    />
                </Form>
                {
                    showRestoreConfirmModal ? (
                        <Modal
                            contentLabel="Restore?"
                            showModal={showRestoreConfirmModal}
                            closeModal={() => setShowRestoreConfirmModal(false)}
                        >
                            <Paragraph>If you have data you have not created a backup for, please do that first.</Paragraph>
                            <Paragraph>Clicking restore will erase everything currently stored in the application.</Paragraph>
                            <ButtonWrapper
                                right={[
                                    <Button
                                        key="cancel"
                                        variation="INTERACTION"
                                        onClick={() => setShowRestoreConfirmModal(false)}
                                        type="button"
                                    >Cancel
                                    </Button>,
                                    <Button
                                        key="restore"
                                        type="button"
                                        variation="WARNING"
                                        onClick={() => handleRestore()}
                                    >
                                        Restore
                                    </Button>
                                ]}
                            />
                        </Modal>
                    ) : (null)
                }
                <ConfirmationModal
                    body="There is no data to backup."
                    title="Heads Up!"
                    confirmationCallback={() => setShowNoDataModal(false)}
                    showModal={showNoDataModal}
                    setShowModal={setShowNoDataModal}
                />
                <ConfirmationModal
                    body="That backup is invalid."
                    title="Heads Up!"
                    confirmationCallback={() => setShowInvalidBackupModal(false)}
                    showModal={showInvalidBackupModal}
                    setShowModal={setShowInvalidBackupModal}
                />
            </div>
        </div>
    )
}

export default Settings
export { setupAutomatedBackup }
