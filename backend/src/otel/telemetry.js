import { NodeSDK, tracing, logs } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';


const prometheusExporter = new PrometheusExporter({
  port: 9464 
});

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "Chat-App",
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://jaeger:4318/v1/traces', // Default OpenTelemetry Collector trace endpoint
    headers: {}, // Optional headers for custom configurations
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://jaeger:4318/v1/metrics', // Default OpenTelemetry Collector metrics endpoint
      headers: {}, // Optional headers for custom configurations
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();




