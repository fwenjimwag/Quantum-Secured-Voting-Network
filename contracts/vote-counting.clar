;; Vote Counting Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_BALLOT (err u101))
(define-constant ERR_INVALID_VOTE (err u102))
(define-constant ERR_ALREADY_VOTED (err u103))

;; Data maps
(define-map vote-counts
  { ballot-id: uint, option: (string-ascii 50) }
  uint
)

(define-map voter-participation
  { ballot-id: uint, voter: principal }
  bool
)

;; Public functions
(define-public (cast-vote (ballot-id uint) (option (string-ascii 50)))
  (let
    (
      (voter tx-sender)
      (ballot (unwrap! (contract-call? .ballot-management get-ballot ballot-id) ERR_INVALID_BALLOT))
      (participation-key { ballot-id: ballot-id, voter: voter })
    )
    (asserts! (is-eq (get status ballot) "active") ERR_INVALID_BALLOT)
    (asserts! (is-some (index-of (get options ballot) option)) ERR_INVALID_VOTE)
    (asserts! (is-none (map-get? voter-participation participation-key)) ERR_ALREADY_VOTED)

    (map-set voter-participation participation-key true)
    (map-set vote-counts
      { ballot-id: ballot-id, option: option }
      (+ (default-to u0 (map-get? vote-counts { ballot-id: ballot-id, option: option })) u1)
    )
    (ok true)
  )
)

(define-read-only (get-vote-count (ballot-id uint) (option (string-ascii 50)))
  (default-to u0 (map-get? vote-counts { ballot-id: ballot-id, option: option }))
)

(define-read-only (has-voted (ballot-id uint) (voter principal))
  (default-to false (map-get? voter-participation { ballot-id: ballot-id, voter: voter }))
)

