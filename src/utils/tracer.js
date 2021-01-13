const { PrometheusMetricsFactory, initTracer } = require('jaeger-client')
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const promClient = require('prom-client');

const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces';
const init = (serviceName) => {
  const config = {
    serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
      collectorEndpoint: JAEGER_ENDPOINT,
    },
  };
  const metrics = new PrometheusMetricsFactory(promClient, serviceName);
  const options = {
    metrics,
    logger: {
      info(msg) {
        console.log('INFO ', msg);
      },
      error(msg) {
        console.log('ERROR', msg);
      },
    },
  };

  return initTracer(config, options);
}

module.exports = (serviceName) => (req, res, next) => {
  const tracer = init(serviceName);
  const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, headers);
  const span = tracer.startSpan(`HTTP ${method} /${url.trim().split('/')[4]}`, {
    childOf: parentSpanContext,
  });
  span.setTag(Tags.HTTP_URL, url);
  tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  span.finish();
  req.tracer = tracer;
  next();
}
