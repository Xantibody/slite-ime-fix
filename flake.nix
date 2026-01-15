{
  description = "Slite Japanese IME Fix - Chrome Extension";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
          ];

          shellHook = ''
            echo "Slite IME Fix dev environment"
            echo "Run 'pnpm install' to install dependencies"
            echo "Run 'pnpm test' to run tests"
          '';
        };
      }
    );
}
