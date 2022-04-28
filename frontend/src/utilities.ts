import React from 'react'

import { context } from 'Context'
import moment from 'moment'
import { TDateFormat, TProject, TProjectStatus, TTask} from 'sharedTypes'

const projectStatusLookup: Record<TProjectStatus, string> = {
    [TProjectStatus.CANCELED]: "Canceled",
    [TProjectStatus.COMPLETED]: "Completed",
    [TProjectStatus.IN_PROGRESS]: "In Progress",
    [TProjectStatus.NEW]: "New"
}

const dateFormatLookup = {
    [TDateFormat.A]: 'dddd MMMM Do YYYY',
    [TDateFormat.B]: 'dddd MMMM Do',
    [TDateFormat.C]: 'MM/DD/YY',
    [TDateFormat.D]: 'DD/MM/YY',
}

const formatDateDisplayString = (date: moment.Moment | null): string => {
    const {state} = React.useContext(context)

    if (date === null) {
        return ''
    }

    return date.format(dateFormatLookup[state.settings.dateFormat])
}

const formatDateKeyLookup = (date: moment.Moment): string => {
    return date.format('YYYY-MM-DD')
}

const formatDurationDisplayString = (rawMinutes: number) => {
    var hours = Math.floor(rawMinutes / 60)
    var minutes = rawMinutes % 60

    const paddedHours = hours < 10 ? '0' + hours : hours
    const paddedMinutes = minutes < 10 ? '0' + minutes : minutes
    return paddedHours + ':' + paddedMinutes
}

const bucketTasksByProject = (projects: Record<string, TProject>  , tasks: Record<string, TTask>) => {
    const accumulator: Record<string, TTask[]> = {}

    Object.keys(projects).forEach(key => {
        accumulator[key] = []
    })

    Object.values(tasks).forEach((curr) => {
        accumulator[curr.projectId].push(curr)
    })

    return accumulator
}


export {
    projectStatusLookup,
    formatDateDisplayString,
    formatDateKeyLookup,
    formatDurationDisplayString,
    bucketTasksByProject,
    dateFormatLookup
}