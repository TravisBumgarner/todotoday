import React from 'react'
import { Button, ButtonWrapper, Heading } from 'sharedComponents'
import { TDateISODate } from 'sharedTypes'

import AddSuccessModal from './AddSuccessModal'
import SuccessesTable from './SuccessesTable'

type SuccessesProps = {
    selectedDate: TDateISODate
}

const Successes = ({ selectedDate }: SuccessesProps) => {
    const [showSuccessModal, setShowSuccessModal] = React.useState<boolean>(false)

    return (
        <div>
            <Heading.H3>Successes</Heading.H3>
            <ButtonWrapper
                left={[
                    <Button key="add" onClick={() => setShowSuccessModal(true)} variation="INTERACTION">Add New Success</Button>
                ]}
            />
            <SuccessesTable selectedDate={selectedDate} />
            {
                showSuccessModal
                    ? <AddSuccessModal selectedDate={selectedDate} showModal={showSuccessModal} setShowModal={setShowSuccessModal} />
                    : null
            }

        </div>
    )
}

export default Successes
