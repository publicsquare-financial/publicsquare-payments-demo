This is an official [PublicSquare](https://publicsquare.com) demo app that showcases how to integrate PublicSquare Payment Services with your Ecommerce or Platform of choice.

This app uses Javascript, React & Next.js, but you are free to use whatever language you would like. Refer to the [developer documentation](https://developers.publicsquare.com/) for detailed explanations for each language.

## Quick start

### Dependencies

```bash
npm i
# or
yarn i
# or
pnpm i
# or
bun i
```

### Environment Configuration

Rename the `.env.example` file to `.env` and update the api key variables named `NEXT_PUBLIC_PUBLICSQUARE_API_URI`, `NEXT_PUBLIC_PUBLICSQUARE_API_KEY` and `PUBLICSQUARE_API_SECRET` from your account in the [PublicSquare portal](https://portal.publicsquare.com/developers/api-keys).

#### Apple Pay domain association per processor

The file `public/.well-known/apple-developer-merchantid-domain-association` is processor-specific. When testing Apple Pay with the **Moov** or **Nuvei** processor, replace the contents of that file with the corresponding version found in `public/.well-known/moov/` or `public/.well-known/nuvei/`.

If you add support for a new processor that needs Apple Pay, include its own domain association file under `public/.well-known/<processor-name>/` and swap it into `public/.well-known/apple-developer-merchantid-domain-association` when testing that processor.

### Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open [http://localhost:3000/ecommerce](http://localhost:3000/ecommerce) with your browser to see the Ecommerce demo.
