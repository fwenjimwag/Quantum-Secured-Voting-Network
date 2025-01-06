;; Ballot Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_BALLOT (err u101))
(define-constant ERR_BALLOT_CLOSED (err u102))

;; Data variables
(define-data-var ballot-count uint u0)

;; Data maps
(define-map ballots
  uint
  {
    title: (string-ascii 100),
    description: (string-utf8 1000),
    options: (list 10 (string-ascii 50)),
    start-block: uint,
    end-block: uint,
    status: (string-ascii 20)
  }
)

;; Public functions
(define-public (create-ballot (title (string-ascii 100)) (description (string-utf8 1000)) (options (list 10 (string-ascii 50))) (duration uint))
  (let
    (
      (ballot-id (+ (var-get ballot-count) u1))
      (start-block block-height)
      (end-block (+ block-height duration))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (map-set ballots
      ballot-id
      {
        title: title,
        description: description,
        options: options,
        start-block: start-block,
        end-block: end-block,
        status: "active"
      }
    )
    (var-set ballot-count ballot-id)
    (ok ballot-id)
  )
)

(define-public (close-ballot (ballot-id uint))
  (let
    (
      (ballot (unwrap! (map-get? ballots ballot-id) ERR_INVALID_BALLOT))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (is-eq (get status ballot) "active") ERR_BALLOT_CLOSED)
    (ok (map-set ballots
      ballot-id
      (merge ballot { status: "closed" })
    ))
  )
)

;; Read-only functions
(define-read-only (get-ballot (ballot-id uint))
  (map-get? ballots ballot-id)
)

(define-read-only (get-ballot-count)
  (var-get ballot-count)
)

