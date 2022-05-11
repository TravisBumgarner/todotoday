import React from 'react'
import moment from 'moment'
import { useLiveQuery } from 'dexie-react-hooks'

import { Button, ButtonWrapper, Heading } from 'sharedComponents'
import { formatDateDisplayString, formatDateKeyLookup, formatDurationDisplayString, sumArray } from 'utilities'
import database from 'database'
import { TDateISODate } from 'sharedTypes'
import { context } from 'Context'
import { TodoListTable, ManageTodoListItemsModal } from './components'

const TodoList = () => {
    const [selectedDate, setSelectedDate] = React.useState<TDateISODate>(formatDateKeyLookup(moment()))
    const [showManagementModal, setShowManagementModal] = React.useState<boolean>(false)
    const { state: { dateFormat } } = React.useContext(context)

    const todoListItems = useLiveQuery(
        () => database
            .todoListItems
            .where('todoListDate')
            .equals(selectedDate)
            .toArray(),
        [selectedDate]
    )

    const getPreviousDay = () => {
        setSelectedDate(formatDateKeyLookup(moment(selectedDate).subtract(1, 'day')))
    }
    const getToday = () => {
        setSelectedDate(formatDateKeyLookup(moment()))
    }
    const getNextDay = () => {
        setSelectedDate(formatDateKeyLookup(moment(selectedDate).add(1, 'day')))
    }

    const hoursWorkedSelectedDate = todoListItems
        ? `(${formatDurationDisplayString(sumArray(todoListItems.map(({ duration }) => duration)))} Worked)`
        : ''

    return (
        <>
            <Heading.H2>{formatDateDisplayString(dateFormat, selectedDate)} {hoursWorkedSelectedDate}</Heading.H2>
            <ButtonWrapper
                left={[
                    <Button key="today" onClick={getToday} variation="PRIMARY_BUTTON">Today</Button>,
                ]}
                right={[
                    <Button key="previous" onClick={getPreviousDay} variation="PRIMARY_BUTTON">Previous</Button>,
                    <Button key="next" onClick={getNextDay} variation="PRIMARY_BUTTON">Next</Button>,
                ]}
            />
            <TodoListTable todoListItems={todoListItems} selectedDate={selectedDate} />
            <Button key="manage" fullWidth onClick={() => setShowManagementModal(true)} variation="PRIMARY_BUTTON">Add Tasks</Button>
            <ManageTodoListItemsModal selectedDate={selectedDate} showModal={showManagementModal} setShowModal={setShowManagementModal} />
        </>
    )
}

export default TodoList
