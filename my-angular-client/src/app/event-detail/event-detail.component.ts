import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  @Input() tableResToDetail: any;
  @Input() clearFromForm: any;
  @Input() tableResToDetailVenue: any;
  @Input() tableResToDetailSpotify: any;
  @Output() retainTable = new EventEmitter<any>();
  ngOnInit() {}
  filled: boolean = false;
  expand: boolean = false;
  expand1: boolean = false;
  expand2: boolean = false;
  mapOptions: any;
  marker: any;
  constructor(private cdr: ChangeDetectorRef) {}
  // the code below, is referrence from stackOverflow
  ngOnChanges(diff: SimpleChanges) {
    // this first function is when click row in table, we check localStorage, it determines, whether the filled is true or not
    if (diff['tableResToDetail'] && diff['tableResToDetail'].currentValue) {
      console.log('this is the id of tableResToDetail');
      console.log(this.tableResToDetail.id);
      if (localStorage.getItem(this.tableResToDetail.id)) {
        this.filled = true;
      } else {
        this.filled = false;
      }
      this.cdr.detectChanges();
    }

    if (
      // I think it is like the event listener
      diff['tableResToDetailVenue'] &&
      diff['tableResToDetailVenue'].currentValue
    ) {
      const weidu = parseFloat(this.tableResToDetailVenue.location.latitude);
      const jingdu = parseFloat(this.tableResToDetailVenue.location.longitude);

      this.mapOptions = {
        center: {
          lat: weidu,
          lng: jingdu,
        },
        zoom: 14.2,
      };

      this.marker = {
        position: {
          lat: weidu,
          lng: jingdu,
        },
      };
      this.cdr.detectChanges();
    }
  }
  goBack(): void {
    console.log('call the go back');
    this.tableResToDetail = null;
    this.retainTable.emit({ value: false, timestamp: new Date().getTime() });
  }
  fillheart() {
    if (this.filled) {
      // past favorite item to be removed
      alert('Event removed from Favorites!');
      if (localStorage.getItem(this.tableResToDetail.id)) {
        localStorage.removeItem(this.tableResToDetail.id);
      }
      this.filled = !this.filled;
    } else {
      // important here, we add new items into localStorage
      alert('Event added to Favorites!');
      localStorage.setItem(
        this.tableResToDetail.id,
        JSON.stringify({
          Date:
            this.tableResToDetail.dates.start &&
            this.tableResToDetail.dates.start.localDate
              ? this.tableResToDetail.dates.start.localDate
              : '',
          Event: this.tableResToDetail ? this.tableResToDetail.name : '',
          Category: this.generateGenre(),
          Venue:
            this.tableResToDetail._embedded.venues &&
            this.tableResToDetail._embedded.venues.length > 0 &&
            this.tableResToDetail._embedded.venues[0]
              ? this.tableResToDetail._embedded.venues[0].name
              : '',
          Timestamp: new Date().getTime(),
        })
      );
      console.log('This is the localStorage after add a new favorite');
      console.log(localStorage);
      this.filled = !this.filled;
    }
  }
  onExpand() {
    this.expand = !this.expand;
  }
  onExpand1() {
    this.expand1 = !this.expand1;
  }
  onExpand2() {
    this.expand2 = !this.expand2;
  }
  getAttractionsNames(): string[] {
    const attractions = this.tableResToDetail._embedded.attractions;
    const names = [];
    console.log(attractions);
    for (let j = 0; j < attractions.length; j++) {
      if (attractions[j].name !== undefined) {
        names.push(j !== 0 ? ' | ' + attractions[j].name : attractions[j].name);
      }
    }

    return names;
  }
  whetherDisplayPriceRange(): boolean {
    return (
      this.tableResToDetail.priceRanges &&
      this.tableResToDetail.priceRanges?.length > 0 &&
      this.tableResToDetail.priceRanges[0].min !== undefined &&
      this.tableResToDetail.priceRanges[0].max !== undefined
    );
  }
  TicketStatus() {
    if (
      !this.tableResToDetail.dates.status ||
      !this.tableResToDetail.dates.status.code ||
      this.tableResToDetail.dates.status.code === 'Undefined'
    ) {
      return null;
    }

    const status_detail_text = this.tableResToDetail.dates.status.code;
    let status_detail_label = '';
    let backgroundColor = '';

    if (status_detail_text === 'onsale') {
      status_detail_label = 'On Sale';
      backgroundColor = 'green';
    } else if (status_detail_text === 'offsale') {
      status_detail_label = 'Off Sale';
      backgroundColor = 'red';
    } else if (status_detail_text === 'cancelled') {
      status_detail_label = 'Canceled';
      backgroundColor = 'black';
    } else if (status_detail_text === 'postponed') {
      status_detail_label = 'Postponed';
      backgroundColor = 'orange';
    } else if (status_detail_text === 'rescheduled') {
      status_detail_label = 'Rescheduled';
      backgroundColor = 'orange';
    }

    return { status_detail_label, backgroundColor };
  }

  generateGenre(): string {
    if (
      !this.tableResToDetail.classifications ||
      this.tableResToDetail.classifications.length === 0
    ) {
      return '';
    }

    const genreArray = this.tableResToDetail.classifications;
    let text = '';

    if (
      genreArray[0].segment?.name &&
      genreArray[0].segment.name !== 'Undefined'
    ) {
      text += ' | ' + genreArray[0].segment.name;
    }
    if (genreArray[0].genre?.name && genreArray[0].genre.name !== 'Undefined') {
      text += ' | ' + genreArray[0].genre.name;
    }
    if (
      genreArray[0].subGenre?.name &&
      genreArray[0].subGenre.name !== 'Undefined'
    ) {
      text += ' | ' + genreArray[0].subGenre.name;
    }
    if (genreArray[0].type?.name && genreArray[0].type.name !== 'Undefined') {
      text += ' | ' + genreArray[0].type.name;
    }
    if (
      genreArray[0].subType?.name &&
      genreArray[0].subType.name !== 'Undefined'
    ) {
      text += ' | ' + genreArray[0].subType.name;
    }

    return text.startsWith(' | ') ? text.substr(2) : text;
  }
}
