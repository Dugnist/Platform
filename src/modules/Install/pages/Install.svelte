<script>
  import Button from 'svelte-atoms/Button.svelte';
  import Block from 'svelte-atoms/Block.svelte';
  import Typography from 'svelte-atoms/Typography.svelte';
  import { Grid, GridItem } from '../../../ui';

  let toolslist = [
    {
      title: 'Enviropment',
      tools: [
        { image: './images/nodejs.svg', imgwidth: '65', name: 'Node.js' },
        { image: './images/yarn.svg', imgwidth: '60', name: 'Yarn' },
        { image: './images/docker.svg', imgwidth: '70', name: 'Docker' },
        {
          image: './images/dockercompose.svg',
          imgwidth: '55',
          name: 'Docker-Compose',
        },
        {
          image: './images/portainer.svg',
          imgwidth: '70',
          name: 'Portainer',
        },
        { image: './images/pm2.svg', imgwidth: '60', name: 'PM2' },
      ],
    },
    {
      title: 'Server',
      tools: [
        { image: './images/nginx.svg', imgwidth: '100', name: 'Nginx' },
        { image: './images/haproxy.svg', imgwidth: '60', name: 'Haproxy' },
        { image: './images/traefik.svg', imgwidth: '60', name: 'Traefik' },
      ],
    },
    {
      title: 'Cache',
      tools: [
        { image: './images/memcached.svg', imgwidth: '60', name: 'Memcached' },
        { image: './images/redis.svg', imgwidth: '60', name: 'Redis' },
        // { image: './images/ignite.svg', imgwidth: '60', name: 'Apache Ignite' },
      ],
    },
    {
      title: 'Databases',
      tools: [
        { image: './images/mongodb.svg', imgwidth: '60', name: 'MongoDB' },
        { image: './images/postgresql.svg', imgwidth: '60', name: 'PostgreQL' },
        { image: './images/neo4j.svg', imgwidth: '60', name: 'Neo4j' },
      ],
    },
    {
      title: 'Orchestration',
      tools: [
        {
          image: './images/kubernetes.svg',
          imgwidth: '60',
          name: 'Kubernetes',
        },
        {
          image: './images/nomad.svg',
          imgwidth: '60',
          name: 'Nomad',
        },
        {
          image: './images/consul.svg',
          imgwidth: '60',
          name: 'Consul',
        },
      ],
    },
    {
      title: 'Brokers',
      tools: [
        { image: './images/rabbitmq.svg', imgwidth: '60', name: 'RabbitMQ' },
        { image: './images/kafka.svg', imgwidth: '60', name: 'Kafka' },
      ],
    },
    {
      title: 'Configurations',
      tools: [
        { image: './images/terraform.svg', imgwidth: '60', name: 'Terraform' },
        { image: './images/ansible.svg', imgwidth: '60', name: 'Ansible' },
        { image: './images/zookeeper.svg', imgwidth: '60', name: 'Zookeeper' },
      ],
    },
    {
      title: 'CI/CD',
      tools: [
        { image: './images/jenkins.svg', imgwidth: '60', name: 'Jenkins' },
        {
          image: './images/github.svg',
          imgwidth: '60',
          name: 'GitHub Actions',
        },
        {
          image: './images/gitlab.svg',
          imgwidth: '60',
          name: 'GitLab CI/CD',
        },
        {
          image: './images/travisci.svg',
          imgwidth: '60',
          name: 'Travis CI',
        },
        {
          image: './images/circleci.svg',
          imgwidth: '60',
          name: 'Circle CI',
        },
        { image: './images/heroku.svg', imgwidth: '60', name: 'Heroku-cli' },
      ],
    },
    {
      title: 'Search',
      tools: [
        {
          image: './images/elasticsearch.svg',
          imgwidth: '60',
          name: 'ElasticSearch',
        },
        {
          image: './images/elasticsearch.svg',
          // image: './images/sphinx.svg',
          imgwidth: '60',
          name: 'Sphinx',
        },
      ],
    },
    {
      title: 'Credentials',
      tools: [{ image: './images/vault.svg', imgwidth: '60', name: 'Vault' }],
    },
    {
      title: 'Monitoring',
      tools: [
        { image: './images/kibana.svg', imgwidth: '60', name: 'Kibana' },
        {
          image: './images/prometheus.svg',
          imgwidth: '60',
          name: 'Prometheus',
        },
        { image: './images/grafana.svg', imgwidth: '60', name: 'Grafana' },
        { image: './images/graphite.svg', imgwidth: '60', name: 'Graphite' },
        { image: './images/datadog.svg', imgwidth: '60', name: 'DataDog' },
        { image: './images/jaeger.svg', imgwidth: '60', name: 'Jaeger' },
      ],
    },
    {
      title: 'Logs',
      tools: [
        { image: './images/logstash.svg', imgwidth: '60', name: 'Logstash' },
        { image: './images/influxdb.svg', imgwidth: '60', name: 'InfluxDB' },
      ],
    },
  ];
</script>

<style>
  :global(.grid) {
    display: flex;
  }
  :global(.card) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 200px;
    min-height: 60px;
    cursor: pointer;
    transition: background 0.5s ease;
  }
  :global(.card):hover {
    background: #dee;
  }
  :global(.card-description) {
    text-align: right;
  }
  :global(.card-description div) {
    margin: 4px 0;
  }
</style>

<div>
  {#each toolslist as sector}
    <br />
    {sector.title}
    <hr />
    <br />
    <Grid>
      {#each sector.tools as tool}
        <GridItem>
          <Block type="block3" class="card">
            <img src={tool.image} alt={tool.name} width={tool.imgwidth} />
            <div class="card-description">
              <div style="font-size: 11px">
                name:
                <b>{tool.name}</b>
              </div>
              <div style="font-size: 11px">
                version:
                <b>0.0.1</b>
              </div>
              <div style="font-size: 11px">
                <i>Not installed</i>
              </div>
              <div style="font-size: 11px">
                <a href="install">Install</a>
              </div>
            </div>
          </Block>
        </GridItem>
      {/each}
    </Grid>
  {/each}
</div>
