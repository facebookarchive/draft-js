/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Layout from '@theme/Layout';

import classnames from 'classnames';

import DraftEditorExample from '../components/DraftEditorExample';
import MediaEditorExample from '../components/MediaEditorExample';
import styles from './styles.module.css';

/** Won't render children on server */
function ClientOnly({children, fallback}) {
  if (typeof window === 'undefined') {
    return fallback || null;
  }
  return children;
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  return (
    <Layout permalink="/" description={siteConfig.tagline}>
      <div className={styles.blm}>
        Black Lives Matter.{' '}
        <a
          target="_blank"
          rel="noopener"
          rel="noreferrer"
          href="https://support.eji.org/give/153413/#!/donation/checkout">
          Support&nbsp;the&nbsp;Equal&nbsp;Justice&nbsp;Initiative.
        </a>
      </div>
      <div className="hero hero--primary shadow--lw">
        <div className="container">
          <div className="row">
            <div className="col">
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">{siteConfig.tagline}</p>
              <div>
                <Link
                  className="button button--secondary button--lg"
                  to={useBaseUrl('docs/getting-started')}>
                  Get Started
                </Link>
              </div>
            </div>
            <div className="col text--center">
              <img
                className={styles.demoGif}
                src={useBaseUrl('/img/demo.gif')}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="margin-vert--xl">
          <div className="row">
            <div className="col">
              <h3>Extensible and Customizable</h3>
              <p>
                We provide the building blocks to enable the creation of a broad
                variety of rich text composition experiences, from basic text
                styles to embedded media.
              </p>
            </div>
            <div className="col">
              <h3>Declarative Rich Text</h3>
              <p>
                Draft.js fits seamlessly into React applications, abstracting
                away the details of rendering, selection, and input behavior
                with a familiar declarative API.
              </p>
            </div>
            <div className="col">
              <h3>Immutable Editor State</h3>
              <p>
                The Draft.js model is built with{' '}
                <a
                  href="https://immutable-js.github.io/immutable-js/"
                  target="_blank"
                  rel="noreferrer noopener">
                  immutable-js
                </a>
                , offering an API with functional state updates and aggressively
                leveraging data persistence for scalable memory usage.
              </p>
            </div>
          </div>
        </div>
        <div
          className={classnames(
            'row',
            'margin-vert--xl',
            styles.hideOnTabletAndSmaller,
          )}>
          <ClientOnly fallback={null}>
            <div
              className="col col--6 col--offset-3"
              style={{textAlign: 'center'}}>
              <h2>Try it out!</h2>
              <p>
                Here's a simple example of a rich text editor built in Draft.js.
              </p>
            </div>
            <div className="row" style={{width: '100%'}}>
              <div className="col">
                <div id="rich-example">
                  <DraftEditorExample />
                </div>
              </div>
              <div className="col">
                <div id="rich-example">
                  <MediaEditorExample />
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
        <div className="margin-vert--xl text--center">
          <Link
            className="button button--primary button--lg"
            to={useBaseUrl('docs/getting-started')}>
            Learn more about Draft.js
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
