# Stephen Porter - Staff Engineer

## Event-driven Cart

---

### Contents

---

- [Before We Begin](#before-we-begin)
- [Main Tech Stack](#main-tech-stack)
- [Getting Started](#getting-started)
  1. [Running the Local Env](#step-1-running-the-local-environment)
  1. [Running the Code](#step-2-running-the-code)
- [Testing](#testing)
- [Extra Things I Did](#extra-things-i-did)

---

### Before We Begin

---

I wasn't quite happy with where things left off after the coding exercise and had to reflect a bit on it. Part of the issue is you spend quite some time building large applications, you often get stuck in the "overthinking" mindset when it comes to doing smaller, more trivial things... especially when being tested. Just the habit of thinking on the larger, production scale.

Anyhow, I wanted to throw together a quick example of how I would approach a cart implementation beyond a one file, simplistic example. As, let's be honest, a cart system is a bit more complex than that. In fact, I'd argue a cart warrants it's own contextual boundary and domain within a microservices architecture.

Fundamentally, it's the end result of a series of events that a user takes (add to cart, remove from cart, update quantity, etc.). By playing the actions in order, you get a final materialized view which represents the state of your cart. What a perfect Event-driven candidate!

So, what I wrote here is a very quickly slapped together example of what something like that may look like. Now, I fully acknowledge that there are uncovered edge cases and some ugly stuff to clean up, but this should give a pretty decent gist.

---

### Main Tech Stack

---

**NOTE**: This solution was written/built on an M1 Mac w/ Apple Silicon which could possibly lead to cross-platform issues on some things (e.g. docker images built for arm64 vs amd64). I did test on my Windows 10 Desktop and all worked well there. If you run into any issues with running the solution, please email me and I can help to sort it out.

For specific versions of each of the following technologies if not listed here, please refer to the docker-compose.yaml at the project root and note the version tags of each image or reference the package.json.

- [yarn v1](https://classic.yarnpkg.com/lang/en/)
- [Node v18](https://nodejs.org/en/)
- [Nx](https://nx.dev/)
- [NestJS](https://nestjs.com/)
- [Docker](https://www.docker.com/) and [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Kafka](https://kafka.apache.org/) using [Confluent Images](https://hub.docker.com/u/confluentinc)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma 2](https://www.prisma.io/)

---

### Getting Started

---
---

#### Step 1: Running The Local Environment

---

1. Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
1. Make sure you have [Node v18](https://nodejs.org/en/) installed (I used 18.12.1 which is current LTS as of writing this)
   1. If you use nvm, there is a nice `.nvmrc` in the project root :)
   1. If you use nodenv, I got your back too with that sweet `.node-version`... Another :)
1. Make sure you have [yarn v1](https://classic.yarnpkg.com/lang/en/) installed (`npm i -g yarn` - you can use npm, but all the commands I give in this README are yarn)
1. Open a terminal window to the project root
1. Run `yarn` or `yarn install`
  1. **NOTE**: Unfortunately, this project is using an older version of Nx which relied on `stylus` and that package was found to have malicious code and was removed and replaced with a security version. So when you install, you'll have to select the 0.0.1-security version of 'stylus' when prompted if using `yarn`. `npm` seems to resolve this auto-magically.
1. Run `yarn all:build` to make sure everything builds
1. Run `yarn env:up`
   1. You may need to give the start script execution permissions (`chmod +x ./tools/scripts/start.sh`)
   1. The bash script was written on a Unix system and has Unix line endings. If you are on Windows, you'll need to do things the manual way (or use a unix subsystem... or convert the line endings, dealer's choice)
1. Confirm the script executes completely and has a final prompt of:

   ```bash
   ======================================
   Local development environment started!
   ======================================
   Press any key to exit when done
   ```

1. Leave the terminal window open and active until you are done. Once done, go back to this terminal window and hit any key.

If you have any issues running the start script, you can spin up the local environment manually:

1. Run `docker-compose up -d`
1. Wait until the Kafka broker is up
   1. You can run `docker-compose exec -T broker kafka-broker-api-versions --bootstrap-server broker:9092 2> /dev/null | awk '/id/{print $1}'` every few seconds or so until you get back `localhost:9092` or open a browser and navigate to http://localhost:9021 and monitor the cluster status from Confluent Control Center.
1. Run `yarn prisma:migrate:up`
1. Run `yarn prisma:generate`
1. Run `yarn prisma:seed`
1. When you finish your testing, you'll spin the environment down by running `docker-compose down --remove-orphans` and you'll probably want to do a `rm -rf broker` to clean up the kafka broker junk.

---

#### Step 2: Running the Code

---

The solution is broken up into two main applications: api and processor. The api app is the REST api you'll query against and the processor app is the async processor for performing the materialization of the final view as events flow through the kafka stream.

To run the code together:

1. Open a second terminal window so you don't bother your environment
1. Run `yarn serve:all` to spin up both apps
  1. You'll see some Kafka whining as it spins up and connects. Just wait until all text stops and you see that final
  ```
  [Nest] 36155  - 07/23/2025, 3:32:39 AM     LOG 🚀 Processor consumer is running
  ```

1. Once everything is spun up, navigate to <http://localhost:3333> where you will be greeted with a Swagger page documenting the API.
   - You can use this page to query the API or the classic postman, Thunder Client, Insomnia, or good ol' cURL approaches

---

### Testing

---

This solution has two types of tests written in Jest. Unit and Integration. The unit tests aren't completely thorough, but cover pretty much everything that should be tested and the integration tests cover the database integration.

Run Unit Tests

1. All Unit Tests
   1. Run `yarn all:unit`
1. Specific Unit Tests
   1. Run `yarn unit <APP_OR_LIB_NAME>` (e.g. `yarn unit api`)
      1. Apps are located under `/apps` and libs are located under `/libs`
1. Unit Tests for Affected Code
   1. Run `yarn affected:unit`

Run All Integration Tests

1. All Integration Tests
   1. Run `yarn all:integration`
1. Specific Integration Tests
   1. Run `yarn integration <APP_OR_LIB_NAME>` (e.g. `yarn integration db`)
   1. When done, run `yarn integration:down`
1. Integration Tests for Affected Code
   1. Run `yarn affected:integration`

You can also be a total boss and test all the things at once with a simple `yarn test`
