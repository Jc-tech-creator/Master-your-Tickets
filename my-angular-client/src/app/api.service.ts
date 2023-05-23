import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

import { autocomplete } from './autocomplete';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  ipkey = '8976382e5cc2f2';
  GeoKey = 'AIzaSyDWzcop693ZXXkFYSO_Ns7VDxeIOf3F9-I';
  rootURL = '/';
  autoCompleteUrl = this.rootURL + 'autoComplete?InputWord=';
  eventDetailUrl = this.rootURL + 'detail?Event_id=';
  venueDetailUrl = this.rootURL + 'venue?Keyword=';
  artistDetailUrl = this.rootURL + 'artist?Attraction=';
  albumDetailUrl = this.rootURL + 'artist/album?spotifyArtistID=';

  constructor(private http: HttpClient) {}

  fetchAutocomplete(input: string): Observable<autocomplete[]> {
    if (input === '') {
      return of([]);
    } else {
      const fetchAutocompleteUrl = `${this.autoCompleteUrl}${input}`;
      console.log(fetchAutocompleteUrl);
      return this.http.get<autocomplete[]>(fetchAutocompleteUrl).pipe(
        catchError(this.MeetError('fetchAutocomplete', [])) // then handle the error
      );
    }
  }
  eventDetail(id: string): Observable<any> {
    const fetcheventDetailUrl = `${this.eventDetailUrl}${id}`;
    console.log(fetcheventDetailUrl);
    return this.http
      .get(fetcheventDetailUrl)
      .pipe(catchError(this.MeetError('fetcheventDetail', null)));
  }
  VenueDetail(name: string): Observable<any> {
    const fetchVenueDetailUrl = `${this.venueDetailUrl}${name}`;
    console.log(fetchVenueDetailUrl);
    return this.http
      .get(fetchVenueDetailUrl)
      .pipe(catchError(this.MeetError('fetchVenueDetail', null)));
  }
  ArtistDetail(name: string): Observable<any> {
    const fetchArtistDetail = `${this.artistDetailUrl}${name}`;
    console.log(fetchArtistDetail);
    return this.http
      .get(fetchArtistDetail)
      .pipe(catchError(this.MeetError('fetchArtistDetail', null)));
  }
  albumDetail(id: string): Observable<any> {
    const fetchAlbumDetailUrl = `${this.albumDetailUrl}${id}`;
    console.log(fetchAlbumDetailUrl);
    return this.http
      .get(fetchAlbumDetailUrl)
      .pipe(catchError(this.MeetError('fetchAlbumDetail', null)));
  }

  searchEvent(formData: any): Observable<any> {
    const {
      gridCheck,
      inputLocation,
      inputCategory,
      inputKeyword,
      inputDistance,
    } = formData;

    let Lat: any;
    let Lon: any;

    const FinalSearchCall = () => {
      const searchUrl = `${this.rootURL}search?Keyword=${inputKeyword}&Distance=${inputDistance}&Lat=${Lat}&Lon=${Lon}&Category=${inputCategory}`;
      console.log(searchUrl);
      return this.http.get(searchUrl);
    };

    if (gridCheck) {
      const IpInfoUrl = `https://ipinfo.io/json?token=${this.ipkey}`;
      return this.http.get(IpInfoUrl).pipe(
        catchError((error) => {
          console.error('Error:', error);
          return of(null);
        }),
        switchMap((response: any) => {
          if (response) {
            const [lat, lon] = response.loc.split(',');
            Lat = lat;
            Lon = lon;
          }
          return FinalSearchCall();
        })
      );
    } else {
      const GeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${inputLocation}&key=${this.GeoKey}`;
      return this.http.get(GeocodingUrl).pipe(
        catchError((error) => {
          console.error('Error:', error);
          return of(null);
        }),
        switchMap((response: any) => {
          //switchMap: here is to Chaining HTTP requests: make a second HTTP request using the result of the first request.
          if (response) {
            Lat = response.results[0].geometry.location.lat;
            Lon = response.results[0].geometry.location.lng;
          }
          return FinalSearchCall();
        })
      );
    }
  }

  private MeetError<T>(operation = 'operation', result?: T) {
    // reference from given tutorial
    return (error: any): Observable<T> => {
      console.error(error);

      console.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }
}
