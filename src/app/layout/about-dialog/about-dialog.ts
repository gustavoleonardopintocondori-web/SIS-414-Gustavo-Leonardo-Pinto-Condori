import { Component, output } from '@angular/core';

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.html',
  styleUrl: './about-dialog.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class AboutDialog {
  readonly closed = output<void>();
}
