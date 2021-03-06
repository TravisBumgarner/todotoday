import React from 'react'
import styled from 'styled-components'
import ReactModal from 'styled-react-modal'

import { Heading, Icon } from '.'

type ModalProps = {
    children: any
    showModal: boolean
    closeModal: () => void
    contentLabel: string
}

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;

    ${Heading.H1}{
        margin-right: 2rem;
    }

    svg {
        cursor: pointer;
        fill: ${({ theme }) => theme.FOREGROUND};
        position: relative;
        right: -13px;
        top: -14px;

    &:hover {
        fill: ${({ theme }) => theme.FOREGROUND};
        }
    }
    ${Heading.H2}{
        font-size: 2rem;
    }

    ${Heading.H3}{
        font-size: 1.25rem;
    }
`

const ModalWrapper = styled.div`
    min-width: 400px;
`

const Modal = ({
    children, showModal, closeModal, contentLabel
}: ModalProps) => {
    return (
        <ReactModal
            isOpen={showModal}
            onBackgroundClick={closeModal}
            onEscapeKeydown={closeModal}
        >
            <ModalWrapper>
                <HeaderWrapper>
                    <Heading.H2>{contentLabel}</Heading.H2>
                    <Icon name="close" onClick={closeModal} />
                </HeaderWrapper>
                {children}
            </ModalWrapper>
        </ReactModal>
    )
}

export default Modal
