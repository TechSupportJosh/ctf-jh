<template>
  <div class="row">
    <div class="col-12">
      <h3>Welcome to Intake CTF 2021!</h3>
    </div>
  </div>
  <hr />
  <h4>What is a CTF?</h4>
  <p>
    CTF (Capture The Flag) is a competition where participants attempt to solve a range of tasks related to cyber security. These challenges
    vary from real life style challenges, such as bypassing authentication on a website, to fun challenges such as time-based scripting
    challenges which require you to do something within a short period of time. In these challenges, the goal is to get a piece of text
    known as a flag, hence the name Capture The Flag!
  </p>
  <h4>What does a flag look like?</h4>
  <p>
    In most CTFs, flags look like CTF{some_phrase_or_random_string_here}, where CTF is commonly replaced with the name of the CTF or the
    organisation running it. In this CTF, flags will be of the style: <code>WMG{wowee_a_free_flag???}</code>
  </p>
  <h4>How to connect to challenges?</h4>
  <p>
    For some challenges, an IP and port is given. In order to connect to these, you will need to use your Lab VPN that has been emailed to
    you. Follow the instructions provided in these emails to connect to the VPN. Once connected, you will then be able to access these URLs
    through a browser or through <code>netcat</code>, depending on the challenge.
  </p>
  <h4>How to download to challenge files?</h4>
  <p>
    For some challenges, you are provided with a downloadable file associated with the challenge. For each file, an MD5 sum is provided to
    ensure that the file has been downloaded correctly and not modified/corrupted during transit. On Linux, you can use
    <code>md5sum file.txt</code> or on Windows you can use <code>Get-FileHash file.txt -Algorithm MD5</code> and then verify that the hash
    outputted is the same as displayed on the website.
  </p>
  <h4>Something else wrong?</h4>
  <p>If you have an issue, make a ticket on the Discord server in the #intake-ctf-support channel and we'll help you as soon as we can.</p>
</template>

<style scoped>
h4 {
  font-size: 1.75em;
  font-weight: bold;
}
p {
  font-size: 1.25em;
  margin-bottom: 2rem;
}
code {
  font-size: 1em;
}
</style>
