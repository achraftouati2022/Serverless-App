import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
//import Axios from 'axios'

const logger = createLogger('auth')

//const jwksUrl = 'https://twati.us.auth0.com/.well-known/jwks.json'

const certificate =`-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJDBJTfZbtiSJeMA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEnR3YXRpLnVzLmF1dGgwLmNvbTAeFw0yMjEwMDUxODIxNDFaFw0zNjA2MTMx
ODIxNDFaMB0xGzAZBgNVBAMTEnR3YXRpLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAMcRjr7KUDtWj+KDUBVM05kK497s234tSePC
MOHVDtLC6BnXvO2nT9rllyJxKUu88K0xQ1b97BqIu601JQtsiKVp1YOA7fnDYOod
O0OEIjLU2KUNesvlSIgnGzbdTuPyhOuY3J99K4+zcZlHhyT+8m0rUjRF7UjlSk2W
LdiCVEls4r67hZoxTBJhsILkdUvvU01uTLvdQ7C3HKhp9IY4EMHQfgOtdEI578Hz
ronnIlv9Mv7vqWcVB7eJQm2vpxObamumjrJjtoh/O7J5ExLcU6yS7LxLNBw9Zpz8
kmB0omQLKwB+RNH8eYcVXfBm47CftVjXlrJtpLjHUJ7KfI6KVtkCAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUBCBlBPTLmGHeMi2E6q9DN7JYM8Uw
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCDPR3pYhlZRBjyX0tS
8Kg2LPI1Fc1lRB7mQpwlxbR7Ko1Svd5Au7qvBIX5L6hV8pA9ViJ3ib1s7aTVciJA
DBCOktljxip9J2XdSD2N28rU5TdoM8/PeFcEWOfeSwhCPj8zFqW8WgKEce7I4SZt
OKVVQYnNwh5DYrOai6qwiFL50N5sPcCtJZHhgUZ8RQQjg9WWyt1UGVx/1FNvA/l1
NMPjFthoO8o3wYauveJ0pEu0+PPt3uL/p3M+d2OwPK4619TKOU+bkYHoLRPG8nFg
Q5x56hQ3M6ZiVh6Mh0dVto98wEeaIDFUH70j38MvtgGZKXydbs1JeZS6a0E6bH9W
cddP
-----END CERTIFICATE-----`
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  //const response = await Axios.get(jwksUrl)
  //const responseData = response['data']['keys'][0]['x5c'][0]
  //const certificate = `-----BEGIN CERTIFICATE-----\n${responseData}\n-----END CERTIFICATE-----`

  return verify(token,certificate,{algorithms:['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}