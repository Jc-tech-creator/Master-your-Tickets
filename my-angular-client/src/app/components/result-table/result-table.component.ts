import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.css'],
})
export class ResultTableComponent implements OnInit {
  detailRes: any;
  arrayOfSpotify: any[] = [];
  @Input() searchResToTable: any;
  @Input() clearResTable: any;
  @Output() resultForEventDetail = new EventEmitter<any>();
  @Output() resultForVenueDetail = new EventEmitter<any>();
  @Output() resultForSpotifyDetail = new EventEmitter<any>();
  @ViewChild('scrollTarget') scrollTarget!: ElementRef;
  constructor(private apiservice: ApiService) {}

  ngOnInit() {}

  dataSource(): any {
    return this.sortResByDate().slice(0, 20);
  }

  sortResByDate(): any {
    if (!this.searchResToTable) {
      return null;
    }
    if (this.searchResToTable === 'empty') {
      return null;
    }

    return this.searchResToTable.sort(
      (
        one: { dates: { start: { localDate: number; localTime: any } } },
        two: { dates: { start: { localDate: number; localTime: any } } }
      ) => {
        if (two.dates.start.localDate === one.dates.start.localDate) {
          return (one.dates.start.localTime || '') <
            (two.dates.start.localTime || '')
            ? -1
            : 1;
        } else {
          return one.dates.start.localDate < two.dates.start.localDate ? -1 : 1;
        }
      }
    );
  }
  onClickRow(id: any) {
    this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.clearResTable = true;
    console.log(this.clearResTable);
    console.log(id);
    this.apiservice.eventDetail(id).subscribe({
      next: (response) => {
        console.log('API response pf eventDetail:', response);
        this.detailRes = response;
        console.log(this.detailRes);
        // would try call venue API here
        console.log(response._embedded.venues[0].name);
        this.fetchVenueDetail(response._embedded.venues[0].name);
        //emit detailRes
        this.resultForEventDetail.emit(this.detailRes);
        //would try to call searchArtists here
        console.log(response._embedded.attractions);
        this.fetchArtistDetail(response._embedded.attractions);
      },
      error: (exception) => {
        console.error('API error in onClickrOW:', exception);
      },
    });
  }
  fetchVenueDetail(name: string) {
    this.apiservice.VenueDetail(name).subscribe({
      next: (res) => {
        console.log('API response pf venueDetail:', res);
        console.log(res._embedded.venues[0]);
        this.resultForVenueDetail.emit(res._embedded.venues[0]);
      },
      error: (exception) => {
        console.error('API error in fetchVenueDetail:', exception);
      },
    });
  }
  //below is the complex fetchArtistDetail Function
  async fetchArtistDetail(array: any[]) {
    if (array === undefined || array.length === 0) {
      this.arrayOfSpotify = [];
      this.resultForSpotifyDetail.emit(this.arrayOfSpotify);
      return;
    }
    const promises: Promise<any>[] = [];

    for (let i = 0; i < array.length; i++) {
      console.log('this is array[i]');
      console.log(array[i]);
      if (
        array[i].classifications[0].segment === undefined ||
        array[i].classifications[0].segment.name !== 'Music'
      ) {
        continue;
      }
      //below are all music related artists
      const pair: any[] = [];
      if (array[i].name !== undefined) {
        const promise = firstValueFrom(
          this.apiservice.ArtistDetail(array[i].name)
        )
          .then((res) => {
            console.log('API response of ArtistDetail:', res);
            if (res.artists.items.length > 0) {
              const cand1 = res.artists.items[0];
              console.log(cand1);
              console.log(cand1.id);
              if (cand1.id) {
                return this.fetchAlbumDetail(cand1, pair);
              }
            }
            return;
          })
          .catch((exception) => {
            console.error('API error in fetchArtistDetail:', exception);
          });
        //push the current promise into promises array
        if (promise) {
          console.log('enter into if-promise');
          console.log(promise);
          promises.push(promise);
        }
      }
    }
    // try catch
    try {
      const AllData = await Promise.all(promises);
      console.log(AllData);
      const filteredAllData: any[] = [];
      for (let i = 0; i < AllData.length; i++) {
        if (AllData[i] !== undefined) {
          filteredAllData.push(AllData[i]);
        }
      }
      console.log(filteredAllData);
      this.arrayOfSpotify = filteredAllData;
      console.log('this is arrayOfSpotify');
      console.log(this.arrayOfSpotify);
      this.resultForSpotifyDetail.emit(this.arrayOfSpotify);
    } catch (error) {
      console.error('Error occur while waiting all promise:', error);
    }
  }
  fetchAlbumDetail(cand1: any, pair: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiservice.albumDetail(cand1.id).subscribe({
        next: (res) => {
          console.log('API response pf albumDetail:', res);
          const cand2 = res;
          pair.push(cand1, cand2);
          console.log(pair);
          resolve(pair);
        },
        error: (exception) => {
          console.error('API error in albumDetail:', exception);
          reject(exception);
        },
      });
    });
  }
}
