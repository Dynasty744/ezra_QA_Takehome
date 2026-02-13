import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ConfirmationPage - Scan confirmation page after payment
 */
export class ConfirmationPage extends BasePage {
  // Locators
  readonly appointmentDetails: Locator;
  readonly scanType: Locator;
  readonly appointmentDateTime: Locator;
  readonly locationName: Locator;
  readonly fillQuestionnaireButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Appointment details
    this.appointmentDetails = page.locator(
      '[data-testid="scan-confirm__details-container"], .scan-confirm__details-container'
    );
    this.scanType = page.locator(
      '[data-testid="scan-details"], .scan-details'
    );
    this.appointmentDateTime = page.locator(
      '[data-testid="appointment-date"], .scan-details__row:has-text("Date") .b2'
    );
    this.locationName = page.locator(
      '[data-testid="location-name"], .scan-details__row:has-text("Location") .b2'
    );
    
    // Action buttons
    this.fillQuestionnaireButton = page.locator(
      'button:has-text("Begin Medical Questionnaire"), [data-testid="questionnaire"]'
    );
  }

  /**
   * Navigate to confirmation page
   */
  async navigate() {
    await this.goto('/book-scan/scan-confirm');
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.appointmentDetails.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Verify confirmation page is displayed
   */
  async verifyConfirmationDisplayed() {
    await expect(this.appointmentDetails).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify all essential confirmation elements are present
   */
  async verifyCompleteConfirmation() {
    await this.verifyConfirmationDisplayed();
    await expect(this.appointmentDetails).toBeVisible();
    await expect(this.fillQuestionnaireButton).toBeVisible();
  }
}
