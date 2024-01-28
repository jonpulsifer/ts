import { check } from 'k6';
import type { Options } from 'k6/options';
import http from 'k6/http';

export const options: Options = {
  vus: 1,
  // iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.001'], // http errors should be less than 0.1%
    http_req_duration: ['p(99)<5000'], // 99% of requests should be below 5s
  },
  scenarios: {
    my_super_awesome_load_scenario: {
      executor: 'ramping-vus',
      stages: [
        // ramp up to load of 10 virtual users
        { duration: '10s', target: 10 },
        // immediately jump to 500 virtual users and stay there for 10s
        { duration: '0s', target: 500 },
        { duration: '10s', target: 500 },
        // ramp down to zero
        { duration: '5s', target: 0 },
      ],
    },
  },
};


export default () => {
  const res = http.get('https://request-headers.lolwtf.ca/api/headers');

  check(res, {
    'status is 200': () => res.status === 200,
    'response body test': () => res.json('data') === 'k6',
  });
  // sleep(1);
};
