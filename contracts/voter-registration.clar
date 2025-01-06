;; Voter Registration Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_ALREADY_REGISTERED (err u101))
(define-constant ERR_INVALID_VOTER (err u102))

;; Data variables
(define-data-var voter-count uint u0)

;; Data maps
(define-map voters
  principal
  {
    name: (string-ascii 50),
    age: uint,
    registration-time: uint,
    quantum-key: (buff 64),
    status: (string-ascii 20)
  }
)

;; Public functions
(define-public (register-voter (name (string-ascii 50)) (age uint) (quantum-key (buff 64)))
  (let
    (
      (voter tx-sender)
    )
    (asserts! (is-none (map-get? voters voter)) ERR_ALREADY_REGISTERED)
    (asserts! (>= age u18) ERR_INVALID_VOTER)
    (map-set voters
      voter
      {
        name: name,
        age: age,
        registration-time: block-height,
        quantum-key: quantum-key,
        status: "active"
      }
    )
    (var-set voter-count (+ (var-get voter-count) u1))
    (ok true)
  )
)

(define-public (update-quantum-key (new-quantum-key (buff 64)))
  (let
    (
      (voter tx-sender)
      (voter-data (unwrap! (map-get? voters voter) ERR_INVALID_VOTER))
    )
    (ok (map-set voters
      voter
      (merge voter-data { quantum-key: new-quantum-key })
    ))
  )
)

(define-public (deactivate-voter (voter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (match (map-get? voters voter)
      voter-data (ok (map-set voters
        voter
        (merge voter-data { status: "inactive" })
      ))
      ERR_INVALID_VOTER
    )
  )
)

;; Read-only functions
(define-read-only (get-voter-data (voter principal))
  (map-get? voters voter)
)

(define-read-only (get-voter-count)
  (var-get voter-count)
)

