import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';
import { PaymentPage } from '../pages/PaymentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';

/**
 * Configure tests to run in serial to manage state and avoid conflicts.
 * This is important for payment tests to ensure we don't have multiple 
 * tests trying to book the same slot or interfere with each other's date/timeslot.
 * This can be removed if the test environment is robust enough to handle 
 * parallel bookings without conflicts, but for payment validation it's
 * safer to run serially at the expense of test speed.
 */
test.describe.configure({ mode: 'serial' });

test.describe('Payment Processing', () => {
    let dashboardPage: DashboardPage;
    let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.loginWithTestUser();
    
    try {
      await dashboardPage.verifyAppointmentExists('MRI');
      console.log('  Appointment found - proceeding with cancellation');
      await dashboardPage.cancelAppointment('MRI');
    } catch (error) {
      console.log('  No existing MRI appointment found - skipping cancellation');
    }
  });

  test.afterEach(async ({ }, testInfo) => {
    // Conditional teardown: Only run if appointment was likely created
    const shouldCleanup = 
      testInfo.status === 'passed' || 
      (testInfo.status === 'failed' && testInfo.errors.some(e => 
        e.message?.includes('confirmation') || 
        e.message?.includes('dashboard') ||
        e.message?.includes('appointment')
      ));
    
    if (shouldCleanup) {
      console.log('  Running teardown: Cancelling appointment...');
      try {
        await dashboardPage.cancelAppointment('MRI');
        await dashboardPage.verifyAppointmentNotExists('MRI');
        console.log('  Teardown complete - appointment cancelled');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  Teardown failed: ${errorMessage}`);
      }
    } else {
      console.log('  Skipping teardown - test failed before appointment creation');
    }
  });

  async function navigateToPaymentPage(page: any) {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const selectPlanPage = new SelectPlanPage(page);
    const schedulePage = new ScheduleScanPage(page);

    console.log('  Setup for payment validation...');
    console.log('  Starting booking flow...');
    await dashboardPage.startBookingFlow();

    console.log('  Selecting MRI scan...');
    await selectPlanPage.completePlanSelection('MRI');

    console.log('  Scheduling appointment...');
    await schedulePage.completeScheduleSelection();
  }

  test('Should process valid payment', async ({ page }) => {
    await navigateToPaymentPage(page);
    
    const paymentPage = new PaymentPage(page);
    const confirmationPage = new ConfirmationPage(page);

    console.log('Step 1: Checking payment security...');
    await paymentPage.verifyPaymentSecurity();

    console.log('Step 2: Completing payment with valid test card...');
    await paymentPage.completePayment(process.env.VALID_TEST_CARD_NUMBER || '4242424242424242');
    
    console.log('Step 3: Verifying confirmation page...');
    await confirmationPage.verifyConfirmationDisplayed();
  });

  test('Should reject declined card', async ({ page }) => {
    await navigateToPaymentPage(page);
    
    const paymentPage = new PaymentPage(page);
    
    console.log('Step 1: Completing payment with declined card...');
    await paymentPage.completeFailedPayment('declined');
    
    console.log('Step 2: Verifying payment error is displayed...');
    await paymentPage.verifyPaymentError();
  });

  test('Should reject insufficient funds card', async ({ page }) => {
    await navigateToPaymentPage(page);
    
    const paymentPage = new PaymentPage(page);
    
    console.log('Step 1: Completing payment with insufficient funds card...');
    await paymentPage.completeFailedPayment('insufficient_funds');
    
    console.log('Step 2: Verifying payment error is displayed...');
    await paymentPage.verifyPaymentError();
  });
});
