export interface CekresiResult {
  text: string;
  thumbnail: string;
  name: string;
}

export interface CekresiParser {
  parse(awb: string, body: string): CekresiResult;
}
