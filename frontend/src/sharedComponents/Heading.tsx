import styled from 'styled-components'

const H1 = styled.h1`
    color: ${({ theme }) => theme.WARNING};
    margin: 0;
`

const H2 = styled.h2`
    color: ${({ theme }) => theme.WARNING};
    margin: 2rem 0 1.5rem 0;
    font-size: 2.5rem;
`

const H3 = styled.h3`
    color: ${({ theme }) => theme.WARNING};
    margin: 2rem 0 1.5rem 0;
    font-size: 1.8rem;
`

const H4 = styled.h4`
    color: ${({ theme }) => theme.WARNING};
    margin: 2rem 0 1.5rem 0;
`

export { H1, H2, H3, H4 }
