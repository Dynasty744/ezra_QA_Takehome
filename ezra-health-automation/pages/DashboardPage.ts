import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly bookScanButton: Locator;
  readonly encounterCard: Locator;

  constructor(page: Page) {
    super(page);
    this.bookScanButton = page.locator('[data-testid="book-scan-btn"], button:has-text("Book a scan")');
    this.encounterCard = page.locator('[data-testid="encounter-card"], .encounter-list-item');
  }

  async navigate() {
    await this.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async startBookingFlow() {
    await this.safeClick(this.bookScanButton);
    await this.waitForURL(/book-scan|select-plan/);
  }

  async verifyAppointmentExists(scanType?: string) {
    await this.waitForVisible(this.encounterCard);
    if (scanType) {
      const text = await this.encounterCard.first().textContent();
      expect(text?.toLowerCase()).toContain(scanType.toLowerCase());
    }
  }
}
