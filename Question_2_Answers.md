# Ezra Booking Flow - Test Cases

## Question 2

### Part 2: HTTP Requests

---

#### 1. End-to-End Critical User Journey

1. POST /api/auth/login
2. GET /api/scan-types
3. POST /api/bookings/plan
4. GET /api/locations?state=CA
5. GET /api/locations/{locationId}/availability?scanType={scanType}
6. GET /api/locations/{locationId}/timeslots?date={date}
7. POST /api/bookings/schedule
8. POST /api/payments/create
9. POST /api/payments/process
10. GET /api/bookings/{bookingId}/confirmation
11. GET /api/questionnaires/{appointmentId}
12. POST /api/questionnaires/{questionnaireId}/submit
13. GET /api/appointments

#### 2. Payment Process Validation

##### credit card payment (success)

1. POST /api/payments/create
2. POST /api/payments/process -> (valid cc)
3. GET /api/payments/{paymentId}/status
4. GET /api/bookings/{bookingId}/confirmation
5. GET /api/appointments/{appointmentId}

##### failed credit card (declined)

1. POST /api/payments/create
2. POST /api/payments/process -> (invalid cc)
3. GET /api/payments/{paymentId}/status -> (verify invalid cc)
4. GET /api/bookings/{bookingId}/status -> (verify incompleted)
5. GET /api/appointments -> appointmentId should NOT exist

##### incomplete payment (insufficient funds)

1. POST /api/payments/create
2. POST /api/payments/process -> (insufficient fund card)
3. GET /api/payments/{paymentId}/status -> (verify insufficient funds)
4. GET /api/bookings/{bookingId}/status -> (verify payment pending)

#### 3. Questionnaire Deadline Enforcement

##### completed on time

1. create appointment 7 days out
    1. POST /api/appointments
    2. POST /api/bookings/create

2. on day 2 (5 days left), complete and submit questionnaire
    1. GET /api/questionnaires/{appointmentId}/questions
    2. POST /api/questionnaires/{appointmentId}/submit
    3. PUT /api/questionnaires/{appointmentId}/complete

3. verify questionnaire completion
    1. GET /api/questionnaires/{appointmentId}/status

##### missed deadline

1. create appointment 7 days out
    1. POST /api/appointments
    2. POST /api/bookings/create

2. on day 3 (4 days left)
    1. GET /api/questionnaires/{appointmentId}/status

3. verify appointment has been cancelled
    1. GET /api/appointments/{appointmentId}/status

---
